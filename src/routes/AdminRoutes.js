const express = require('express');
const router = express.Router();
const adminController = require('../controller/AdminController');
const { authMiddleware, isAdmin } = require('../middleware/Auth');

router.use(authMiddleware);
router.use(isAdmin);

router.post('/api-keys', adminController.generateApiKey);
router.get('/api-keys', adminController.getApiKeys);
router.delete('/api-keys/:keyId', adminController.revokeApiKey);
router.get('/api-keys/:keyId/stats', adminController.getUsageStats);
router.get('/stats', adminController.getSystemStats);
router.post('/events/participation', adminController.recordEventParticipation);

module.exports = router;