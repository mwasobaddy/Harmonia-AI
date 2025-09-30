const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const prisma = require('../prismaClient');
const settingsService = require('../services/settingsService');

// Get all users (admin only)
router.get('/users', authenticateToken, async (req, res) => {
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
        createdAt: true,
        updatedAt: true
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

// Update user role (admin only)
router.put('/users/:userId/role', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Get admin analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { range = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    console.log('Analytics request:', { range, startDate });

    // Get analytics data
    const [
      totalUsers,
      newUsers,
      totalOrders,
      newOrders,
      totalDocuments,
      newDocuments
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // New users in range
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),

      // Total orders
      prisma.order.count({
        where: { deletedAt: null }
      }),

      // New orders in range
      prisma.order.count({
        where: {
          createdAt: {
            gte: startDate
          },
          deletedAt: null
        }
      }),

      // Total documents
      prisma.document.count(),

      // New documents in range
      prisma.document.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      })
    ]);

    console.log('Basic counts:', { totalUsers, newUsers, totalOrders, newOrders });

        // Get top offense types (simplified)
    let offenseTypes = [];
    try {
      const offenseTypeStats = await prisma.order.groupBy({
        by: ['offenseType'],
        where: {
          deletedAt: null,
          // offenseType is a required string in the schema; exclude empty strings just in case
          offenseType: {
            not: ''
          }
        },
        _count: {
          offenseType: true
        },
        orderBy: {
          _count: {
            offenseType: 'desc'
          }
        }
      });

      offenseTypes = offenseTypeStats.map(stat => ({
        type: stat.offenseType,
        count: stat._count.offenseType
      }));
    } catch (offenseError) {
      console.error('Error getting offense types:', offenseError);
      offenseTypes = [];
    }

    const analytics = {
      overview: {
        totalUsers,
        newUsers,
        totalOrders,
        newOrders,
        totalDocuments,
        newDocuments,
        conversionRate: totalUsers > 0 ? ((totalOrders / totalUsers) * 100).toFixed(1) : 0
      },
      charts: {
        userRegistrations: [],
        orderData: []
      },
      offenseTypes
    };

    console.log('Analytics response:', analytics);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get admin settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // includeSecrets=false masks secret values
    const settings = await settingsService.getAllSettings({ includeSecrets: false });
    res.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update admin settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings format' });
    }

    // Persist whitelisted settings; secrets will be encrypted when SETTINGS_ENCRYPTION_KEY or JWT_SECRET is present
    const updated = await settingsService.upsertSettings(settings, { encryptSecrets: true, returnPlainSecrets: false });

    res.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;