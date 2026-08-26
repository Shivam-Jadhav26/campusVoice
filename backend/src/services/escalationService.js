const ComplaintHistory = require('../models/ComplaintHistory');
const User = require('../models/User');
const Department = require('../models/Department');
const mongoose = require('mongoose');
const { notifyComplaintEscalated } = require('./notificationService');
const { ESCALATION_CHAIN, ESCALATION_ROLES, DEFAULT_ESCALATION_HOURS } = require('../utils/constants');

const getNextHandlerForLevel = async (level, department) => {
  const role = ESCALATION_ROLES[level];
  let query = { role };

  if (role !== 'admin' && department) {
    let deptId = department;
    if (typeof department === 'string' && !mongoose.Types.ObjectId.isValid(department)) {
      const deptDoc = await Department.findOne({ name: { $regex: new RegExp(`^${department}$`, 'i') } });
      if (deptDoc) deptId = deptDoc._id;
    }
    if (mongoose.Types.ObjectId.isValid(deptId)) {
      query.department = deptId;
    }
  }

  let handler = await User.findOne(query);
  if (!handler && role !== 'admin') {
    handler = await User.findOne({ role });
  }
  return handler;
};

const getEscalationHoursForLevel = (level, escalationConfig = {}) => {
  const role = ESCALATION_ROLES[level];
  return escalationConfig[role] || DEFAULT_ESCALATION_HOURS[role] || 24;
};

const escalateComplaint = async (complaint) => {
  const currentLevel = complaint.escalationLevel || 0;
  
  if (currentLevel >= 3) {
    complaint.escalationLevel = 3;
    await complaint.save();
    return complaint;
  }

  const nextLevel = currentLevel + 1;
  const nextHandler = await getNextHandlerForLevel(nextLevel, complaint.department);
  
  if (!nextHandler) {
    console.warn(`No handler found for level ${nextLevel} in department ${complaint.department}`);
    complaint.escalationLevel = nextLevel;
    await complaint.save();
    return complaint;
  }

  const hoursForNextLevel = getEscalationHoursForLevel(nextLevel);
  const previousHandlerId = complaint.currentHandlerId;
  const previousHandlerName = complaint.currentHandlerName;

  complaint.escalationLevel = nextLevel;
  complaint.currentHandler = ESCALATION_CHAIN[nextLevel];
  complaint.currentHandlerId = nextHandler._id;
  complaint.currentHandlerName = nextHandler.name;
  complaint.status = 'Escalated';
  complaint.isEscalated = true;
  
  const now = new Date();
  complaint.deadline = new Date(now.getTime() + hoursForNextLevel * 3600000);

  await complaint.save();

  await ComplaintHistory.create({
    complaint: complaint._id,
    action: 'Escalated',
    description: `Complaint escalated from ${previousHandlerName || 'Previous Level'} to ${nextHandler.name} (${ESCALATION_CHAIN[nextLevel]})`,
    isSystem: true
  });

  await notifyComplaintEscalated(complaint, nextHandler._id, complaint.student);

  return complaint;
};

module.exports = {
  escalateComplaint,
  getNextHandlerForLevel,
  getEscalationHoursForLevel
};
