const AuditLog = require('../models/AuditLog');
const { sendSuccess, sendError } = require('../utils/responseHelpers');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, userId, action, entityType, dateFrom, dateTo, status } = req.query;
    
    const query = {};
    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (status) query.status = status;
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    
    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
      
    const total = await AuditLog.countDocuments(query);
    
    return sendSuccess(res, { logs, total, page: parseInt(page), pages: Math.ceil(total / limit) }, 'Audit logs retrieved');
  } catch (error) {
    next(error);
  }
};

exports.createAuditLog = async (userId, action, entityType, entityId, description, req, metadata = {}) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : 'System';
    const userAgent = req ? req.headers['user-agent'] : 'System';
    
    await AuditLog.create({
      userId,
      action,
      entityType,
      entityId,
      description,
      ipAddress,
      userAgent,
      metadata
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};
