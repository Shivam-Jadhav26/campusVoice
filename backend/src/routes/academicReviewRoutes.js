const express = require('express');
const router = express.Router();
const {
  createAcademicReview,
  getAcademicReviews,
  getAcademicReviewById,
  submitFacultyDecision,
  submitHODDecision
} = require('../controllers/academicReviewController');
const { verifyJWT, authorizeRoles } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(verifyJWT);

router.post('/', authorizeRoles('student'), upload.array('attachments', 3), createAcademicReview);
router.get('/', getAcademicReviews);
router.get('/:id', getAcademicReviewById);

router.post('/:id/faculty-decision', authorizeRoles('teacher'), submitFacultyDecision);
router.post('/:id/hod-decision', authorizeRoles('hod'), submitHODDecision);

module.exports = router;
