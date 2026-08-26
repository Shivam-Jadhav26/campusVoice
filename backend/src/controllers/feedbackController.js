const Feedback = require('../models/Feedback');
const aiService = require('../services/aiService');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/responseHelpers');
const { createAuditLog } = require('./auditLogController');

exports.createFeedback = async (req, res, next) => {
  try {
    const { type, department, rating, comment, isAnonymous } = req.body;
    
    const sentimentAnalysis = await aiService.analyzeSentiment(comment);
    
    const feedback = await Feedback.create({
      student: req.user.id,
      type,
      department,
      rating,
      comment,
      isAnonymous,
      sentiment: sentimentAnalysis.sentiment,
      urgencyLevel: sentimentAnalysis.urgencyLevel,
      sentimentScore: sentimentAnalysis.score
    });
    
    // Notify admin/hod
    // Assuming some logic to find HOD of department here...
    
    return sendSuccess(res, { feedback }, 'Feedback submitted successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.getFeedback = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, department, minRating, maxRating, sentiment, dateFrom, dateTo } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (department) query.department = department;
    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = parseInt(minRating);
      if (maxRating) query.rating.$lte = parseInt(maxRating);
    }
    if (sentiment) query.sentiment = sentiment;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    
    let feedbacks = await Feedback.find(query)
      .populate('studentId', 'name email role')
      .populate('departmentId', 'name')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
      
    // Mask anonymous students for non-admins
    if (req.user.role !== 'Admin') {
      feedbacks = feedbacks.map(f => {
        if (f.isAnonymous) {
          const doc = f.toObject();
          doc.studentId = { name: 'Anonymous Student', _id: null };
          return doc;
        }
        return f;
      });
    }
    
    const total = await Feedback.countDocuments(query);
    
    return sendSuccess(res, { feedbacks, total, page: parseInt(page), pages: Math.ceil(total / limit) }, 'Feedback retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getFeedbackById = async (req, res, next) => {
  try {
    let feedback = await Feedback.findById(req.params.id)
      .populate('studentId', 'name email role')
      .populate('departmentId', 'name');
      
    if (!feedback) return sendError(res, 'Feedback not found', 404);
    
    if (feedback.isAnonymous && req.user.role !== 'Admin') {
      feedback = feedback.toObject();
      feedback.studentId = { name: 'Anonymous Student', _id: null };
    }
    
    return sendSuccess(res, { feedback }, 'Feedback retrieved');
  } catch (error) {
    next(error);
  }
};

exports.reviewFeedback = async (req, res, next) => {
  try {
    const { note } = req.body;
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) return sendError(res, 'Feedback not found', 404);
    
    feedback.isReviewed = true;
    feedback.reviewNote = note;
    feedback.reviewedBy = req.user.id;
    feedback.reviewedAt = Date.now();
    await feedback.save();
    
    await createAuditLog(req.user.id, 'REVIEW_FEEDBACK', 'Feedback', feedback._id, 'Feedback reviewed', req);
    
    return sendSuccess(res, { feedback }, 'Feedback marked as reviewed');
  } catch (error) {
    next(error);
  }
};

exports.getFeedbackAnalytics = async (req, res, next) => {
  try {
    const totalFeedback = await Feedback.countDocuments();
    
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          positiveCount: { $sum: { $cond: [{ $eq: ['$sentiment', 'Positive'] }, 1, 0] } },
          negativeCount: { $sum: { $cond: [{ $eq: ['$sentiment', 'Negative'] }, 1, 0] } },
          neutralCount: { $sum: { $cond: [{ $eq: ['$sentiment', 'Neutral'] }, 1, 0] } }
        }
      }
    ]);
    
    const typeBreakdown = await Feedback.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]);
    const departmentBreakdown = await Feedback.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]);
    const ratingDistribution = await Feedback.aggregate([{ $group: { _id: '$rating', count: { $sum: 1 } } }]);
    
    return sendSuccess(res, { 
      totalFeedback, 
      stats: stats[0] || {}, 
      typeBreakdown, 
      departmentBreakdown, 
      ratingDistribution 
    }, 'Analytics retrieved');
  } catch (error) {
    next(error);
  }
};
