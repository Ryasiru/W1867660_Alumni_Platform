const express = require('express');
const router = express.Router();
const authController = require('../controller/AuthController');
const { validateRegistration, checkValidation } = require('../middleware/validation');
const { authMiddleware } = require('../middleware/Auth');

// Public routes
router.post('/register', validateRegistration, checkValidation, authController.register);
router.post('/login', authController.login);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/verify/:token', authController.verifyEmail);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;