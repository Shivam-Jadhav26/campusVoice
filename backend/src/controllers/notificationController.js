const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/responseHelpers');

exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const notifications = await Notification.find({ recipient: req.user.id })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
      
    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
    
    return sendSuccess(res, { notifications, unreadCount, page: parseInt(page) }, 'Notifications retrieved');
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) return sendError(res, 'Notification not found', 404);
    
    return sendSuccess(res, { notification }, 'Marked as read');
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
    return sendSuccess(res, null, 'All marked as read');
  } catch (error) {
    next(error);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
    return sendSuccess(res, { count }, 'Unread count retrieved');
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user.id });
    if (!notification) return sendError(res, 'Notification not found', 404);
    return sendSuccess(res, null, 'Notification deleted');
  } catch (error) {
    next(error);
  }
};
