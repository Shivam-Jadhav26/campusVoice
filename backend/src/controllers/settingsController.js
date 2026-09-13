const SystemSettings = require('../models/SystemSettings');
const { sendSuccess, sendError } = require('../utils/responseHelpers');
const { createAuditLog } = require('./auditLogController');

exports.getSettings = async (req, res, next) => {
  try {
    let settings = await SystemSettings.findOne({ isSingleton: true });
    
    if (!settings) {
      // Create defaults if they don't exist
      settings = await SystemSettings.create({ isSingleton: true });
    }
    
    return sendSuccess(res, { settings }, 'System settings retrieved');
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const updates = req.body;
    
    let settings = await SystemSettings.findOne({ isSingleton: true });
    
    if (!settings) {
      settings = await SystemSettings.create({ isSingleton: true, ...updates });
    } else {
      Object.assign(settings, updates);
      await settings.save();
    }
    
    await createAuditLog(req.user.id, 'UPDATE_SETTINGS', 'SystemSettings', settings._id, 'System settings updated', req);
    
    return sendSuccess(res, { settings }, 'System settings updated successfully');
  } catch (error) {
    next(error);
  }
};
