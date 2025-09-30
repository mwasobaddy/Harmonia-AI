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

// Download document content (streamed as PDF)
const PDFDocument = require('pdfkit');
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

    // Stream PDF response
    res.setHeader('Content-Type', 'application/pdf');
    const filename = document.filename || `mitigation-statement-${id}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ autoFirstPage: true, bufferPages: true });
    doc.pipe(res);

    // Simple text layout: split into paragraphs and add
    const text = document.content || '';
    const paragraphs = text.split(/\n\n+/g);
    paragraphs.forEach((p) => {
      doc.font('Helvetica').fontSize(11).text(p, { align: 'left', paragraphGap: 8 });
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Admin: download any document by ID
router.get('/admin/:id/download', authenticateToken, async (req, res) => {
  try {
    // Only admins may download arbitrary documents
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id }
    });

    if (!document || document.deletedAt) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Stream PDF response for admin download
    res.setHeader('Content-Type', 'application/pdf');
    const filename = (document.filename && document.filename.endsWith('.pdf')) ? document.filename : `mitigation-statement-${id}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ autoFirstPage: true, bufferPages: true });
    doc.pipe(res);

    const text = document.content || '';
    const paragraphs = text.split(/\n\n+/g);
    paragraphs.forEach((p) => {
      doc.font('Helvetica').fontSize(11).text(p, { align: 'left', paragraphGap: 8 });
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    console.error('Error downloading document (admin):', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Admin: update document content (mitigation statement)
router.put('/admin/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { content } = req.body;

    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'Invalid content' });
    }

    const existing = await prisma.document.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = await prisma.document.update({
      where: { id },
      data: {
        content,
        updatedAt: new Date()
      }
    });

    res.json({ document });
  } catch (error) {
    console.error('Error updating document (admin):', error);
    res.status(500).json({ error: 'Failed to update document' });
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