const express = require('express');
const router = express.Router();
const { ProfileController } = require('../controller/ProfileController');
const { apiKeyAuth, requirePermission } = require('../middleware/ApiKeyAuth');

router.get('/featured-alumni', 
  apiKeyAuth, 
  requirePermission('read:featured'),
  ProfileController.getFeaturedAlumni
);

router.get('/profiles/:userId',
  apiKeyAuth,
  requirePermission('read:profile'),
  ProfileController.getProfile
);

module.exports = router;