const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// ✅ Route to fetch old messages
router.get('/messages/:matchId', async (req, res) => {
  try {
    const messages = await Message.find({ matchId: req.params.matchId }).sort('createdAt');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;
