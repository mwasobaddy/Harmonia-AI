const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/authMiddleware');
const prisma = require('../prismaClient');
const redis = require('redis');

// Redis client for getting active conversations
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Redis connection handling
redisClient.on('error', (err) => {
  console.error('❌ Redis connection error in chatRoutes:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis in chatRoutes');
});

// Connect to Redis
redisClient.connect().catch(console.error);

// POST /api/chat
router.post('/', authenticateToken, chatController.handleChat);

// Add a new route for initializing the chat session
router.post('/init', authenticateToken, chatController.initializeChat);

// Get all conversations for the authenticated user
router.get('/conversations', authenticateToken, chatController.getConversations);

// Get a specific conversation by sessionId
router.get('/conversations/:sessionId', authenticateToken, chatController.getConversation);

// Delete a conversation (soft delete for orders, permanent for sessions)
router.delete('/conversations/:sessionId', authenticateToken, chatController.deleteConversation);

// Delete an order by orderId (soft delete)
router.delete('/orders/:orderId', authenticateToken, chatController.deleteOrder);

// Save a draft conversation
router.post('/drafts', authenticateToken, chatController.saveDraft);

// Admin: Get platform statistics
router.get('/admin/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get basic stats for dashboard
    const [totalUsers, totalOrders, pendingReviews] = await Promise.all([
      prisma.user.count(),
      prisma.order.count({
        where: { deletedAt: null }
      }),
      prisma.document.count({
        where: { status: 'PENDING' }
      })
    ]);

    // Get active conversations (Redis keys - simplified)
    let activeConversations = 0;
    try {
      if (redisClient) {
        const keys = await redisClient.keys('chat:*:*');
        activeConversations = keys.length;
      }
    } catch (redisError) {
      console.warn('Redis error getting active conversations:', redisError);
    }

    res.json({
      totalUsers,
      totalOrders,
      pendingReviews,
      activeConversations
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// Admin: Get detailed analytics
router.get('/admin/analytics', authenticateToken, async (req, res) => {
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
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get current period stats
    const [totalUsers, totalOrders, totalDocuments, pendingReviews, approvedDocuments, rejectedDocuments] = await Promise.all([
      prisma.user.count(),
      prisma.order.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      prisma.document.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      prisma.document.count({
        where: { status: 'PENDING_REVIEW' }
      }),
      prisma.document.count({
        where: { status: 'APPROVED' }
      }),
      prisma.document.count({
        where: { status: 'REJECTED' }
      })
    ]);

    // Get previous period stats for growth calculation
    const prevStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const [previousUsers, previousOrders, previousDocuments] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: { lt: startDate, gte: prevStartDate }
        }
      }),
      prisma.order.count({
        where: {
          createdAt: { lt: startDate, gte: prevStartDate }
        }
      }),
      prisma.document.count({
        where: {
          createdAt: { lt: startDate, gte: prevStartDate }
        }
      })
    ]);

    // Mock revenue data (would need actual payment integration)
    const revenue = totalOrders * 25; // Assuming $25 per order
    const previousRevenue = previousOrders * 25;

    // Get active conversations (Redis keys - simplified)
    let activeConversations = 0;
    try {
      if (redisClient) {
        const keys = await redisClient.keys('chat:*:*');
        activeConversations = keys.length;
      }
    } catch (redisError) {
      console.warn('Redis error getting active conversations:', redisError);
    }

    res.json({
      totalUsers,
      totalOrders,
      totalDocuments,
      pendingReviews,
      approvedDocuments,
      rejectedDocuments,
      revenue,
      activeConversations,
      previousUsers,
      previousOrders,
      previousDocuments,
      previousRevenue,
      range
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Admin: Get recent activity
router.get('/admin/recent-activity', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const activities = [];

    // Get recent user registrations (last 10)
    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user_registration',
        title: 'New user registration',
        description: `${user.name || 'User'} (${user.email}) joined the platform`,
        timestamp: user.createdAt,
        icon: 'user'
      });
    });

    // Get recent orders (last 10)
    const recentOrders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    recentOrders.forEach(order => {
      activities.push({
        id: `order-${order.id}`,
        type: 'order_created',
        title: 'New order placed',
        description: `${order.user.name || order.user.email} placed an order for ${order.offenseType}`,
        timestamp: order.createdAt,
        icon: 'order'
      });
    });

    // Get recent documents submitted for review (last 10)
    const recentDocuments = await prisma.document.findMany({
      where: {
        status: 'PENDING_REVIEW'
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        },
        order: {
          select: {
            id: true,
            offenseType: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    recentDocuments.forEach(doc => {
      activities.push({
        id: `document-${doc.id}`,
        type: 'document_submitted',
        title: 'Document submitted for review',
        description: `${doc.user.name || doc.user.email}'s ${doc.order.offenseType} document requires approval`,
        timestamp: doc.createdAt,
        icon: 'document'
      });
    });

    // Get recent document reviews (approved/rejected in last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentReviews = await prisma.document.findMany({
      where: {
        reviewedAt: {
          gte: oneDayAgo
        },
        status: {
          in: ['APPROVED', 'REJECTED']
        }
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        },
        order: {
          select: {
            offenseType: true
          }
        }
      },
      orderBy: {
        reviewedAt: 'desc'
      },
      take: 10
    });

    recentReviews.forEach(doc => {
      activities.push({
        id: `review-${doc.id}`,
        type: 'document_reviewed',
        title: `Document ${doc.status.toLowerCase()}`,
        description: `${doc.user.name || doc.user.email}'s ${doc.order.offenseType} document was ${doc.status.toLowerCase()}`,
        timestamp: doc.reviewedAt,
        icon: 'review'
      });
    });

    // Sort all activities by timestamp (most recent first) and take top 15
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentActivities = activities.slice(0, 15);

    res.json({ activities: recentActivities });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

module.exports = router;