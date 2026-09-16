const express = require('express');
const router = express.Router();
const feedbackRequestController = require('../controllers/feedbackRequestController');
const { verifyJWT, authorizeRoles } = require('../middleware/auth');

router.use(verifyJWT);

// Faculty routes
router.post('/', authorizeRoles('tg', 'class_incharge', 'hod', 'admin'), feedbackRequestController.createRequest);
router.get('/faculty', authorizeRoles('tg', 'class_incharge', 'hod', 'admin'), feedbackRequestController.getFacultyRequests);

// Student routes
router.get('/student', authorizeRoles('student'), feedbackRequestController.getStudentRequests);
router.put('/:id/submit', authorizeRoles('student'), feedbackRequestController.submitResponse);

// Common routes
router.get('/:id', feedbackRequestController.getRequestById);

module.exports = router;
