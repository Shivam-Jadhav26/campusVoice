const express = require('express');
const router = express.Router();
const { login, register, logout, refreshToken, getMe, changePassword } = require('../controllers/authController');
const { verifyJWT } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', verifyJWT, logout);
router.post('/refresh', refreshToken);
router.get('/me', verifyJWT, getMe);
router.put('/change-password', verifyJWT, changePassword);

module.exports = router;
