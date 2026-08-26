const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHelpers');
const { createAuditLog } = require('./auditLogController');

const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, rollNumber, dob, currentYear, departmentName, batch } = req.body;
    
    if (!name || !email || !password) {
      return sendError(res, 'Please provide name, email, and password', 400);
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'Email already in use', 400);
    }
    
    const user = await User.create({
      name,
      email,
      password,
      role: 'student', // Registration is only for students right now
      rollNumber,
      dob,
      currentYear,
      departmentName,
      batch
    });
    
    const { accessToken, refreshToken } = generateTokens(user);
    
    const salt = await bcrypt.genSalt(10);
    user.refreshToken = await bcrypt.hash(refreshToken, salt);
    await user.save();
    
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });
    
    await createAuditLog(user._id, 'REGISTER', 'User', user._id, 'User registered', req);
    
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;
    
    return sendSuccess(res, { user: userObj, accessToken, refreshToken }, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return sendError(res, 'Please provide email and password', 400);
    }
    
    const user = await User.findOne({ email }).select('+password').populate('department');
    if (!user || !user.isActive) {
      return sendError(res, 'Invalid credentials or inactive account', 401);
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }
    
    const { accessToken, refreshToken } = generateTokens(user);
    
    const salt = await bcrypt.genSalt(10);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    user.refreshToken = hashedRefreshToken;
    await user.save();
    
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });
    
    await createAuditLog(user._id, 'LOGIN', 'User', user._id, 'User logged in', req);
    
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;
    
    return sendSuccess(res, { user: userObj, accessToken, refreshToken }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.refreshToken = null;
        await user.save();
        await createAuditLog(user._id, 'LOGOUT', 'User', user._id, 'User logged out', req);
      }
    }
    
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    
    if (!token) {
      return sendError(res, 'No refresh token provided', 401);
    }
    
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
    const user = await User.findById(decoded.id);
    
    if (!user || !user.refreshToken) {
      return sendError(res, 'Invalid refresh token', 401);
    }
    
    const isMatch = await bcrypt.compare(token, user.refreshToken);
    if (!isMatch) {
      return sendError(res, 'Invalid refresh token', 401);
    }
    
    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 15 * 60 * 1000 });
    
    return sendSuccess(res, { accessToken }, 'Token refreshed');
  } catch (error) {
    return sendError(res, 'Invalid or expired refresh token', 401);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('department');
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    return sendSuccess(res, { user }, 'User details retrieved');
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return sendError(res, 'Please provide old and new password', 400);
    }
    
    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    
    if (!isMatch) {
      return sendError(res, 'Incorrect old password', 401);
    }
    
    user.password = newPassword; // Assuming pre-save hook handles hashing, otherwise do it here
    await user.save();
    
    await createAuditLog(user._id, 'PASSWORD_CHANGE', 'User', user._id, 'User changed password', req);
    
    return sendSuccess(res, null, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};
