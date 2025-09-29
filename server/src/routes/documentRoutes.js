const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const prisma = require('../prismaClient');

// Get all documents for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('📄 [DEBUG] Fetching documents for userId:', userId);

    const documents = await prisma.document.findMany({
      where: {
        userId,
        deletedAt: null
      },
      include: {
        order: {
          include: {
            responses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('📄 [DEBUG] Found documents:', documents.length);
    res.json({ documents });
  } catch (error) {
    console.error('❌ [DEBUG] Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get a specific document by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const document = await prisma.document.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      },
      include: {
        order: {
          include: {
            responses: true
          }
        }
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ document });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Download document content
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const document = await prisma.document.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="mitigation-statement-${id}.txt"`);

    res.send(document.content);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Update document status (admin only)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const document = await prisma.document.update({
      where: { id },
      data: { status }
    });

    res.json({ document });
  } catch (error) {
    console.error('Error updating document status:', error);
    res.status(500).json({ error: 'Failed to update document status' });
  }
});

// Admin: Get all documents
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const documents = await prisma.document.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        order: {
          include: {
            responses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ documents });
  } catch (error) {
    console.error('Error fetching all documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

module.exports = router;