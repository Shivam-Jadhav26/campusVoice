const express = require('express');
const router = express.Router();
const {
  getStudentDashboard,
  getStaffDashboard,
  getHODDashboard,
  getAdminDashboard
} = require('../controllers/dashboardController');
const { verifyJWT, authorizeRoles } = require('../middleware/auth');

router.use(verifyJWT);

router.get('/student', authorizeRoles('student'), getStudentDashboard);
router.get('/staff', authorizeRoles('teacher', 'tg', 'class_incharge'), getStaffDashboard);
router.get('/hod', authorizeRoles('hod'), getHODDashboard);
router.get('/admin', authorizeRoles('admin'), getAdminDashboard);

module.exports = router;
