const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditLogController');
const { verifyJWT, authorizeRoles } = require('../middleware/auth');

router.use(verifyJWT);

router.get('/', authorizeRoles('admin'), getAuditLogs);

module.exports = router;
