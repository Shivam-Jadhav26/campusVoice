const Complaint = require('../models/Complaint');
const Feedback = require('../models/Feedback');
const { sendSuccess, sendError } = require('../utils/responseHelpers');

exports.getComplaintAnalytics = async (req, res, next) => {
  try {
    const match = req.user.role === 'HOD' ? { department: req.user.department } : {};
    
    // Category Breakdown
    const categoryStats = await Complaint.aggregate([
      { $match: match },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    // Priority Breakdown
    const priorityStats = await Complaint.aggregate([
      { $match: match },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    // Status Breakdown
    const statusStats = await Complaint.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Monthly Trend (Last 12 months)
    const monthlyTrend = await Complaint.aggregate([
      { $match: match },
      { $group: { _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);
    
    // SLA Resolution Time Calculation (Average time from created to resolved in hours)
    const avgResTimeAggr = await Complaint.aggregate([
      { $match: { ...match, status: 'Resolved', resolvedAt: { $exists: true } } },
      { $project: { resTimeHours: { $divide: [{ $subtract: ["$resolvedAt", "$createdAt"] }, 1000 * 60 * 60] } } },
      { $group: { _id: null, avgTime: { $avg: "$resTimeHours" } } }
    ]);
    const overallAvgResTime = avgResTimeAggr.length > 0 ? avgResTimeAggr[0].avgTime : 0;
    
    // Inflow Rate Calculation (This month vs Last month)
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const currentMonthCount = await Complaint.countDocuments({ ...match, createdAt: { $gte: currentMonthStart } });
    const lastMonthCount = await Complaint.countDocuments({ ...match, createdAt: { $gte: lastMonthStart, $lt: currentMonthStart } });
    
    let inflowChange = 0;
    if (lastMonthCount > 0) {
      inflowChange = ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100;
    } else if (currentMonthCount > 0) {
      inflowChange = 100; // Infinity treated as 100% for simple UI
    }

    // Escalation Rate
    const totalComplaints = await Complaint.countDocuments(match);
    const escalatedComplaints = await Complaint.countDocuments({ ...match, escalationLevel: { $gt: 0 } });
    const escalationRate = totalComplaints > 0 ? (escalatedComplaints / totalComplaints) * 100 : 0;
    
    return sendSuccess(res, { 
      categoryStats, 
      priorityStats, 
      statusStats, 
      monthlyTrend,
      kpis: {
        avgResTime: overallAvgResTime,
        inflowChange,
        escalationRate
      }
    }, 'Complaint analytics');
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
