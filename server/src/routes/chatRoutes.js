const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/authMiddleware');

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

module.exports = router;