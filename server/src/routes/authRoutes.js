const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Google OAuth routes
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleAuthCallback);

// Token verification
router.get('/verify', authController.verifyToken);

// Profile routes
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);

// Logout
router.post('/logout', authController.logout);

// Email/Password Authentication
router.post('/register', authController.register);
router.post('/login', authController.login);

// Legacy login route (for backward compatibility) - now points to email/password login
router.post('/login-legacy', (req, res) => {
  res.json({
    message: 'Please use Google OAuth for authentication',
    googleAuthUrl: `${process.env.BACKEND_URL}/api/auth/google`
  });
});

// Admin: Get all users
router.get('/admin/users', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isVerified: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin: Update user role
router.put('/admin/users/:id/role', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    res.json({ user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Admin: Get settings
router.get('/admin/settings', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // In a real app, settings would be stored in database
    // For now, return mock settings
    const settings = {
      claudeApiKey: process.env.CLAUDE_API_KEY ? '••••••••' : '',
      pineconeApiKey: process.env.PINECONE_API_KEY ? '••••••••' : '',
      stripeSecretKey: process.env.STRIPE_SECRET_KEY ? '••••••••' : '',
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? '••••••••' : '',
      jwtSecret: process.env.JWT_SECRET ? '••••••••' : '',
      clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
      backendUrl: process.env.BACKEND_URL || 'http://localhost:5000'
    };

    res.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Admin: Update settings
router.put('/admin/settings', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { settings } = req.body;

    // In a real app, update database/env file
    // For now, just return success
    console.log('Settings update requested:', Object.keys(settings));

    res.json({ success: true, message: 'Settings updated (mock implementation)' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;