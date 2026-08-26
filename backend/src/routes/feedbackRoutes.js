const express = require('express');
const router = express.Router();
const {
  getFeedbackAnalytics,
  createFeedback,
  getFeedback,
  getFeedbackById,
  reviewFeedback
} = require('../controllers/feedbackController');
const { verifyJWT, authorizeRoles } = require('../middleware/auth');

router.use(verifyJWT);

// Analytics accessible by higher authorities
router.get('/analytics', authorizeRoles('hod', 'admin'), getFeedbackAnalytics);

// Basic CRUD
router.post('/', authorizeRoles('student'), createFeedback);
router.get('/', getFeedback);
router.get('/:id', getFeedbackById);

// Review
router.put('/:id/review', authorizeRoles('admin', 'hod'), reviewFeedback);

module.exports = router;
