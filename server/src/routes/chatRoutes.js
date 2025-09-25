const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/authMiddleware');

// POST /api/chat
router.post('/', authenticateToken, chatController.handleChat);

// Add a new route for initializing the chat session
router.post('/init', authenticateToken, chatController.initializeChat);

module.exports = router;