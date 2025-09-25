const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');

// Placeholder document routes
router.get('/:id', authenticateToken, (req, res) => {
  res.json({ message: 'Document routes to be implemented' });
});

module.exports = router;