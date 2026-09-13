const User = require('../models/User');
const Department = require('../models/Department');
const ComplaintHistory = require('../models/ComplaintHistory');
const mongoose = require('mongoose');
const { notifyComplaintAssigned } = require('./notificationService');
const { DEFAULT_ESCALATION_HOURS } = require('../utils/constants');

const assignInitialHandler = async (complaint, department, escalationLevel = 0) => {
  let deptId = department;
  if (typeof department === 'string' && !mongoose.Types.ObjectId.isValid(department)) {
    const deptDoc = await Department.findOne({ name: { $regex: new RegExp(`^${department}$`, 'i') } });
    if (deptDoc) deptId = deptDoc._id;
  }

  const roleMap = {
    0: 'teacher',
    1: 'tg',
    2: 'class_incharge',
    3: 'hod'
  };

  let targetRole = roleMap[escalationLevel] || 'teacher';
  let handler = null;
  
  if (mongoose.Types.ObjectId.isValid(deptId)) {
    handler = await User.findOne({ role: targetRole, department: deptId });
  }

  // Fallbacks if handler not found in department
  if (!handler) {
    handler = await User.findOne({ role: targetRole });
  }
  
  if (!handler && targetRole !== 'teacher') handler = await User.findOne({ role: 'teacher' });
  if (!handler) handler = await User.findOne({ role: 'hod' });
  if (!handler) handler = await User.findOne({ role: 'admin' });

  if (!handler) {
    throw new Error('No appropriate handler found');
  }

  complaint.escalationLevel = Number(escalationLevel);
  complaint.currentHandler = handler.role === 'teacher' ? 'Teacher' : (handler.role === 'tg' ? 'TG' : (handler.role === 'class_incharge' ? 'Class Incharge' : 'HOD'));
  complaint.currentHandlerId = handler._id;
  complaint.currentHandlerName = handler.name;
  
  const hours = DEFAULT_ESCALATION_HOURS[handler.role] || 24;
  complaint.deadline = new Date(Date.now() + hours * 3600000);

  await complaint.save();

  await ComplaintHistory.create({
    complaint: complaint._id,
    action: 'Complaint Created',
    description: `Assigned to ${complaint.currentHandler}`,
    isSystem: true
  });

  await notifyComplaintAssigned(complaint, handler._id);

  return complaint;
};

const addComplaintHistory = async (complaintId, action, description, performedBy, options = {}) => {
  const { previousStatus, newStatus, previousHandler, newHandler, message, isSystem } = options;
  
  const historyData = {
    complaint: complaintId,
    action,
    description,
    performedBy,
    previousStatus,
    newStatus,
    previousHandler,
    newHandler,
    message,
    isSystem: isSystem || false
  };

  return await ComplaintHistory.create(historyData);
};

const buildComplaintQuery = (param1, param2, param3, param4) => {
  let user, filters;
  if (param1 && (param1.role || param1._id || param1.id)) {
    user = param1;
    filters = param2 || {};
  } else {
    filters = param1 || {};
    user = { _id: param2, role: param3, department: param4 };
  }

  const query = {};
  if (filters.status) {
    // Handle snake_case to Space Case (in_progress -> In Progress) and make case-insensitive
    query.status = new RegExp('^' + filters.status.replace('_', ' ') + '$', 'i');
  }
  if (filters.priority) {
    query.priority = new RegExp('^' + filters.priority + '$', 'i');
  }
  if (filters.category) query.category = filters.category;
  if (filters.department) query.department = filters.department;

  const userId = user._id || user.id;
  const userRole = (user.role || '').toLowerCase();
  const department = user.department;

  if (userRole === 'student') {
    query.studentId = userId;
  } else if (['teacher', 'tg', 'class_incharge', 'hod'].includes(userRole)) {
    const orConditions = [{ currentHandlerId: userId }];
    if (department) {
      orConditions.push({ department });
    }
    query.$or = orConditions;
  }

  if (filters.search) {
    query.$or = query.$or || [];
    const searchRegex = { $regex: filters.search, $options: 'i' };
    query.$or.push({ title: searchRegex }, { complaintNumber: searchRegex }, { description: searchRegex });
  }

  return query;
};

module.exports = {
  assignInitialHandler,
  addComplaintHistory,
  buildComplaintQuery
};
