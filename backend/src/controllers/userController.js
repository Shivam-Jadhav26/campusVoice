const User = require('../models/User');
const Department = require('../models/Department');
const Subject = require('../models/Subject');
const bcrypt = require('bcryptjs');
const { sendSuccess, sendError } = require('../utils/responseHelpers');
const { createAuditLog } = require('./auditLogController');

exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, role, department, currentYear, userClass } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (department) query.departmentName = department;
    if (currentYear) query.currentYear = currentYear;
    if (userClass) query.class = userClass;
    
    const users = await User.find(query)
      .populate('department', 'name')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
      
    const total = await User.countDocuments(query);
    
    return sendSuccess(res, { users, total, page: parseInt(page), pages: Math.ceil(total / limit) }, 'Users retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('department', 'name');
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, { user }, 'User retrieved');
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, phone, class: userClass } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return sendError(res, 'Email already in use', 400);
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await User.create({
      name, email, password: hashedPassword, role, department, phone, class: userClass
    });
    
    await createAuditLog(req.user.id, 'CREATE_USER', 'User', user._id, `User ${email} created`, req);
    
    const userObj = user.toObject();
    delete userObj.password;
    
    return sendSuccess(res, { user: userObj }, 'User created successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const updates = req.body;
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }
    
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return sendError(res, 'User not found', 404);
    
    await createAuditLog(req.user.id, 'UPDATE_USER', 'User', user._id, 'User details updated', req);
    
    return sendSuccess(res, { user }, 'User updated');
  } catch (error) {
    next(error);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);
    
    user.isActive = !user.isActive;
    await user.save();
    
    await createAuditLog(req.user.id, 'TOGGLE_USER_STATUS', 'User', user._id, `User status set to ${user.isActive}`, req);
    
    return sendSuccess(res, { user }, 'User status toggled');
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);
    
    user.isActive = false; // Soft delete
    await user.save();
    
    await createAuditLog(req.user.id, 'DELETE_USER', 'User', user._id, 'User soft deleted', req);
    
    return sendSuccess(res, null, 'User deleted (deactivated)');
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, class: userClass, rollNumber, currentYear, batch, teacherGuardian, classIncharge } = req.body;
    
    const updateData = { name, phone, class: userClass, rollNumber, currentYear, batch };
    if (teacherGuardian) updateData.teacherGuardian = teacherGuardian;
    if (classIncharge) updateData.classIncharge = classIncharge;
    
    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });
    
    return sendSuccess(res, { user }, 'Profile updated');
  } catch (error) {
    next(error);
  }
};

exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find();
    return sendSuccess(res, { departments }, 'Departments retrieved');
  } catch (error) {
    next(error);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    const department = await Department.create({ name, code });
    return sendSuccess(res, { department }, 'Department created', 201);
  } catch (error) {
    next(error);
  }
};

exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ department: req.params.departmentId });
    return sendSuccess(res, { subjects }, 'Subjects retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getTeachersInDepartment = async (req, res, next) => {
  try {
    const teachers = await User.find({ department: req.params.departmentId, role: 'Teacher', isActive: true }).select('name email phone');
    return sendSuccess(res, { teachers }, 'Teachers retrieved');
  } catch (error) {
    next(error);
  }
};
