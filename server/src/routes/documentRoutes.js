const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all documents for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

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

    res.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
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

module.exports = router;