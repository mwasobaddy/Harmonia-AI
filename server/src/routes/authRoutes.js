const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/authController');

// Google OAuth routes
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleAuthCallback);

// Token verification
router.get('/verify', authController.verifyToken);

// Profile routes
router.get('/profile', authController.getProfile);

// Logout
router.post('/logout', authController.logout);

// Legacy login route (for backward compatibility)
router.post('/login', (req, res) => {
  res.json({
    message: 'Please use Google OAuth for authentication',
    googleAuthUrl: `${process.env.BACKEND_URL}/api/auth/google`
  });
});

module.exports = router;