const express = require('express');
const router = express.Router();

// Placeholder webhook routes for Stripe
router.post('/stripe', (req, res) => {
  res.json({ message: 'Stripe webhook handler to be implemented' });
});

module.exports = router;