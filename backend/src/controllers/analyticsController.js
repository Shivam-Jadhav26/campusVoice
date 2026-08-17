const Complaint = require('../models/Complaint');
const Feedback = require('../models/Feedback');
const { sendSuccess, sendError } = require('../utils/responseHelpers');

exports.getComplaintAnalytics = async (req, res, next) => {
  try {
    const match = req.user.role === 'HOD' ? { department: req.user.department } : {};
    
    const categoryStats = await Complaint.aggregate([
      { $match: match },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const priorityStats = await Complaint.aggregate([
      { $match: match },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    const statusStats = await Complaint.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const monthlyTrend = await Complaint.aggregate([
      { $match: match },
      { $group: { _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);
    
    // Average resolution time by department (mock logic)
    const avgResTimeByDept = await Complaint.aggregate([
      { $match: { ...match, status: 'Resolved', resolvedAt: { $exists: true } } },
      { $project: { department: 1, resTime: { $subtract: ["$resolvedAt", "$createdAt"] } } },
      { $group: { _id: '$department', avgTime: { $avg: "$resTime" } } }
    ]);
    
    return sendSuccess(res, { categoryStats, priorityStats, statusStats, monthlyTrend, avgResTimeByDept }, 'Complaint analytics');
  } catch (error) {
    next(error);
  }
};

exports.getFeedbackAnalytics = async (req, res, next) => {
  try {
    const match = req.user.role === 'HOD' ? { department: req.user.department } : {};
    
    const sentimentStats = await Feedback.aggregate([
      { $match: match },
      { $group: { _id: '$sentiment', count: { $sum: 1 } } }
    ]);
    
    const ratingStats = await Feedback.aggregate([
      { $match: match },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);
    
    return sendSuccess(res, { sentimentStats, ratingStats }, 'Feedback analytics');
  } catch (error) {
    next(error);
  }
};

exports.getDepartmentAnalytics = async (req, res, next) => {
  try {
    const stats = await Complaint.aggregate([
      { $group: { _id: '$department', total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } } } }
    ]);
    return sendSuccess(res, { stats }, 'Department analytics');
  } catch (error) {
    next(error);
  }
};
