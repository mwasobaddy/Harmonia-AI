const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat
router.post('/', chatController.handleChat);

// Add a new route for initializing the chat session
router.post('/init', chatController.initializeChat);

module.exports = router;