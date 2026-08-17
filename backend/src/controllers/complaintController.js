const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/responseHelpers');
const complaintService = require('../services/complaintService');
const aiService = require('../services/aiService');
const { createAuditLog } = require('./auditLogController');

exports.createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, department, priority, location, isAnonymous } = req.body;
    
    const attachments = (req.files || []).map(file => ({
      filename: file.originalname,
      originalName: file.originalname,
      url: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));

    // Capitalize priority if passed lowercase
    const formattedPriority = priority ? (priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()) : 'Medium';

    const complaint = new Complaint({
      studentId: req.user.id || req.user._id,
      studentName: isAnonymous ? 'Anonymous Student' : (req.user.name || 'Student'),
      studentRoll: req.user.rollNumber || '',
      studentClass: req.user.class || '',
      title,
      description,
      category: category || 'Other',
      department: department || req.user.departmentName || 'Computer Engineering',
      departmentId: req.user.department,
      priority: ['Low', 'Medium', 'High', 'Critical'].includes(formattedPriority) ? formattedPriority : 'Medium',
      location: location || '',
      attachments,
      followers: [req.user.id || req.user._id]
    });

    await complaint.save();
    
    // Assign handler
    try {
      await complaintService.assignInitialHandler(complaint, req.user.department);
    } catch (err) {
      console.warn('Initial handler assignment warning:', err.message);
    }
    
    await ComplaintHistory.create({
      complaint: complaint._id,
      action: 'Created',
      description: 'Complaint submitted by student',
      performedBy: req.user.id || req.user._id,
      performedByName: req.user.name,
      performedByRole: 'student'
    });
    
    await createAuditLog(req.user.id || req.user._id, 'CREATE_COMPLAINT', 'Complaint', complaint._id, 'Complaint created', req);
    
    return sendSuccess(res, { complaint }, 'Complaint created successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.getComplaints = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, priority, category, department, search, dateFrom, dateTo } = req.query;
    
    const query = complaintService.buildComplaintQuery(req.user, { status, priority, category, department, search, dateFrom, dateTo });
    
    const complaints = await Complaint.find(query)
      .populate('student', 'name email')
      .populate('assignedTo', 'name email')
      .populate('department', 'name')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
      
    const total = await Complaint.countDocuments(query);
    
    return sendSuccess(res, { complaints, total, page: parseInt(page), pages: Math.ceil(total / limit) }, 'Complaints retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('student', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('department', 'name');
      
    if (!complaint) return sendError(res, 'Complaint not found', 404);
    
    const history = await ComplaintHistory.find({ complaint: complaint._id }).populate('actor', 'name role').sort({ createdAt: 1 });
    
    return sendSuccess(res, { complaint, history }, 'Complaint details retrieved');
  } catch (error) {
    next(error);
  }
};

exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, message } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) return sendError(res, 'Complaint not found', 404);
    
    complaint.status = status;
    await complaint.save();
    
    await ComplaintHistory.create({
      complaint: complaint._id,
      action: 'Status Updated',
      actor: req.user.id,
      message: message || `Status changed to ${status}`
    });
    
    await createAuditLog(req.user.id, 'UPDATE_STATUS', 'Complaint', complaint._id, `Complaint status changed to ${status}`, req);
    
    return sendSuccess(res, { complaint }, 'Status updated');
  } catch (error) {
    next(error);
  }
};

exports.replyToComplaint = async (req, res, next) => {
  try {
    const { message } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) return sendError(res, 'Complaint not found', 404);
    
    const history = await ComplaintHistory.create({
      complaint: complaint._id,
      action: 'Replied',
      actor: req.user.id,
      message
    });
    
    return sendSuccess(res, { history }, 'Reply added');
  } catch (error) {
    next(error);
  }
};

exports.resolveComplaint = async (req, res, next) => {
  try {
    const { resolutionNote } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) return sendError(res, 'Complaint not found', 404);
    
    complaint.status = 'Resolved';
    complaint.resolvedAt = Date.now();
    complaint.resolutionNote = resolutionNote;
    await complaint.save();
    
    await ComplaintHistory.create({
      complaint: complaint._id,
      action: 'Resolved',
      actor: req.user.id,
      message: resolutionNote
    });
    
    await Notification.create({
      recipient: complaint.student,
      title: 'Complaint Resolved',
      message: `Your complaint "${complaint.title}" has been resolved.`,
      relatedEntity: complaint._id,
      entityModel: 'Complaint'
    });
    
    await createAuditLog(req.user.id, 'RESOLVE_COMPLAINT', 'Complaint', complaint._id, 'Complaint resolved', req);
    
    return sendSuccess(res, { complaint }, 'Complaint resolved');
  } catch (error) {
    next(error);
  }
};

exports.rejectComplaint = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) return sendError(res, 'Complaint not found', 404);
    
    complaint.status = 'Rejected';
    await complaint.save();
    
    await ComplaintHistory.create({
      complaint: complaint._id,
      action: 'Rejected',
      actor: req.user.id,
      message: reason
    });
    
    await createAuditLog(req.user.id, 'REJECT_COMPLAINT', 'Complaint', complaint._id, 'Complaint rejected', req);
    
    return sendSuccess(res, { complaint }, 'Complaint rejected');
  } catch (error) {
    next(error);
  }
};

exports.escalateComplaint = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) return sendError(res, 'Complaint not found', 404);
    
    complaint.status = 'Escalated';
    // Logic for next escalation level should be handled here
    await complaint.save();
    
    await ComplaintHistory.create({
      complaint: complaint._id,
      action: 'Escalated',
      actor: req.user.id,
      message: reason
    });
    
    await createAuditLog(req.user.id, 'ESCALATE_COMPLAINT', 'Complaint', complaint._id, 'Complaint manually escalated', req);
    
    return sendSuccess(res, { complaint }, 'Complaint escalated');
  } catch (error) {
    next(error);
  }
};

exports.reopenComplaint = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) return sendError(res, 'Complaint not found', 404);
    if (complaint.student.toString() !== req.user.id) return sendError(res, 'Not authorized', 403);
    if (complaint.status !== 'Resolved') return sendError(res, 'Only resolved complaints can be reopened', 400);
    
    complaint.status = 'Pending';
    await complaint.save();
    
    await ComplaintHistory.create({
      complaint: complaint._id,
      action: 'Reopened',
      actor: req.user.id,
      message: reason
    });
    
    await createAuditLog(req.user.id, 'REOPEN_COMPLAINT', 'Complaint', complaint._id, 'Complaint reopened by student', req);
    
    return sendSuccess(res, { complaint }, 'Complaint reopened');
  } catch (error) {
    next(error);
  }
};

exports.checkDuplicates = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const duplicates = await aiService.detectDuplicates(title, description);
    return sendSuccess(res, { duplicates }, 'Checked for duplicates');
  } catch (error) {
    next(error);
  }
};

exports.getAISuggestions = async (req, res, next) => {
  try {
    const { description } = req.body;
    const suggestions = await aiService.analyzeComplaint(description);
    return sendSuccess(res, { suggestions }, 'AI suggestions generated');
  } catch (error) {
    next(error);
  }
};

exports.getComplaintTimeline = async (req, res, next) => {
  try {
    const history = await ComplaintHistory.find({ complaint: req.params.id })
      .populate('actor', 'name role')
      .sort({ createdAt: 1 });
      
    return sendSuccess(res, { timeline: history }, 'Timeline retrieved');
  } catch (error) {
    next(error);
  }
};

exports.followComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return sendError(res, 'Complaint not found', 404);
    
    if (!complaint.followers.includes(req.user.id)) {
      complaint.followers.push(req.user.id);
      await complaint.save();
    }
    
    return sendSuccess(res, { complaint }, 'You are now following this complaint');
  } catch (error) {
    next(error);
  }
};
