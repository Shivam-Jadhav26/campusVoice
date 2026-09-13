const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { verifyJWT, authorizeRoles } = require('../middleware/auth');

router.use(verifyJWT);
router.use(authorizeRoles('admin'));

router.get('/', getSettings);
router.put('/', updateSettings);

module.exports = router;
