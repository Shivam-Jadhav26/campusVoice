const express = require('express');
const router = express.Router();
const {
  getAISuggestions,
  checkDuplicates,
  getComplaints,
  createComplaint,
  getComplaintById,
  getComplaintTimeline,
  replyToComplaint,
  updateComplaintStatus,
  resolveComplaint,
  rejectComplaint,
  escalateComplaint,
  reopenComplaint,
  followComplaint
} = require('../controllers/complaintController');
const { verifyJWT, authorizeRoles } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(verifyJWT);

// Student routes for creating complaints and suggestions
router.get('/ai-suggestions', authorizeRoles('student'), getAISuggestions);
router.post('/check-duplicates', authorizeRoles('student'), checkDuplicates);
router.post('/', authorizeRoles('student'), upload.array('attachments', 5), createComplaint);

// Routes for all authenticated users
router.get('/', getComplaints);
router.get('/:id', getComplaintById);
router.get('/:id/timeline', getComplaintTimeline);

// Student actions on their own complaints
router.post('/:id/reopen', authorizeRoles('student'), reopenComplaint);
router.post('/:id/follow', authorizeRoles('student'), followComplaint);

// Officer routes
router.post('/:id/reply', authorizeRoles('teacher', 'tg', 'class_incharge', 'hod', 'admin', 'committee'), replyToComplaint);
router.put('/:id/status', authorizeRoles('teacher', 'tg', 'class_incharge', 'hod', 'admin', 'committee'), updateComplaintStatus);
router.post('/:id/resolve', authorizeRoles('teacher', 'tg', 'class_incharge', 'hod', 'admin', 'committee'), resolveComplaint);
router.post('/:id/reject', authorizeRoles('teacher', 'tg', 'class_incharge', 'hod', 'admin', 'committee'), rejectComplaint);
router.post('/:id/escalate', authorizeRoles('teacher', 'tg', 'class_incharge', 'hod', 'admin', 'committee'), escalateComplaint);

module.exports = router;
