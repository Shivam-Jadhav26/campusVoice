const FeedbackRequest = require('../models/FeedbackRequest');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHelpers');

exports.createRequest = async (req, res, next) => {
  try {
    const { title, description, studentId, fields } = req.body;
    
    // Validate student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return sendError(res, 'Invalid student ID or not a student', 400);
    }
    
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return sendError(res, 'Fields are required to create a dynamic feedback form', 400);
    }

    const request = await FeedbackRequest.create({
      title,
      description,
      facultyId: req.user.id || req.user._id,
      studentId,
      fields
    });
    
    return sendSuccess(res, { request }, 'Feedback request assigned to student successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.getFacultyRequests = async (req, res, next) => {
  try {
    const facultyId = req.user.id || req.user._id;
    const requests = await FeedbackRequest.find({ facultyId })
      .populate('studentId', 'name email rollNumber class')
      .sort({ createdAt: -1 });
      
    return sendSuccess(res, { requests }, 'Faculty feedback requests retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getStudentRequests = async (req, res, next) => {
  try {
    const studentId = req.user.id || req.user._id;
    const requests = await FeedbackRequest.find({ studentId })
      .populate('facultyId', 'name email role')
      .sort({ createdAt: -1 });
      
    return sendSuccess(res, { requests }, 'Student feedback requests retrieved');
  } catch (error) {
    next(error);
  }
};

exports.submitResponse = async (req, res, next) => {
  try {
    const { responses } = req.body;
    const studentId = req.user.id || req.user._id;
    
    const request = await FeedbackRequest.findOne({ _id: req.params.id, studentId });
    if (!request) {
      return sendError(res, 'Feedback request not found or unauthorized', 404);
    }
    
    if (request.status === 'Completed') {
      return sendError(res, 'Feedback request is already completed', 400);
    }
    
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return sendError(res, 'Responses are required', 400);
    }
    
    request.responses = responses;
    request.status = 'Completed';
    request.submittedAt = new Date();
    
    await request.save();
    
    return sendSuccess(res, { request }, 'Feedback submitted successfully');
  } catch (error) {
    next(error);
  }
};

exports.getRequestById = async (req, res, next) => {
  try {
    const request = await FeedbackRequest.findById(req.params.id)
      .populate('studentId', 'name email rollNumber class')
      .populate('facultyId', 'name email role');
      
    if (!request) return sendError(res, 'Feedback request not found', 404);
    
    // Check auth
    const userId = (req.user.id || req.user._id).toString();
    if (request.facultyId._id.toString() !== userId && request.studentId._id.toString() !== userId) {
      return sendError(res, 'Not authorized to view this request', 403);
    }
    
    return sendSuccess(res, { request }, 'Feedback request retrieved');
  } catch (error) {
    next(error);
  }
};
