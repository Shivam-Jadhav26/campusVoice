const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  getDepartments,
  createDepartment,
  getTeachersInDepartment,
  getSubjects,
  updateProfile,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser
} = require('../controllers/userController');
const { getMe } = require('../controllers/authController');
const { verifyJWT, authorizeRoles } = require('../middleware/auth');

router.use(verifyJWT);

// Profile & public routes
router.get('/departments', getDepartments);
router.get('/departments/:id/teachers', getTeachersInDepartment);
router.get('/subjects', getSubjects);
router.get('/profile', getMe);
router.put('/profile', updateProfile);

// Admin only — departments
router.post('/departments', authorizeRoles('admin'), createDepartment);

// Admin only — users CRUD
router.get('/', authorizeRoles('admin'), getUsers);
router.post('/', authorizeRoles('admin'), createUser);
router.get('/:id', authorizeRoles('admin', 'student', 'teacher', 'tg', 'class_incharge', 'hod', 'committee'), getUserById);
router.put('/:id', authorizeRoles('admin'), updateUser);
router.patch('/:id/toggle-status', authorizeRoles('admin'), toggleUserStatus);
router.delete('/:id', authorizeRoles('admin'), deleteUser);

module.exports = router;
