const express = require('express');
const router = express.Router();
const {
  getComplaintAnalytics,
  getFeedbackAnalytics,
  getDepartmentAnalytics
} = require('../controllers/analyticsController');
const { verifyJWT, authorizeRoles } = require('../middleware/auth');

router.use(verifyJWT);

router.get('/complaints', authorizeRoles('hod', 'admin'), getComplaintAnalytics);
router.get('/feedback', authorizeRoles('hod', 'admin'), getFeedbackAnalytics);
router.get('/departments', authorizeRoles('admin'), getDepartmentAnalytics);

module.exports = router;
