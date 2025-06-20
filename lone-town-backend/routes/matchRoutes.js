const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const User = require('../models/User');

// ✅ PIN MATCH
router.post('/pin', async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.state = 'pinned';
    await user.save();

    res.json({ message: 'Pinned' });
  } catch (err) {
    res.status(500).json({ error: 'Pin failed', details: err.message });
  }
});

// ✅ UNPIN MATCH
// routes/matchRoutes.js
router.post('/unpin', async (req, res) => {
  const { userId } = req.body;
  const freezeUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  try {
    console.log('🧊 Unpin request received. UserID:', userId);

    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    user.state = 'frozen';
    user.freezeUntil = freezeUntil;

    // ✅ Only update if this field exists in schema
    if ('currentMatch' in user) {
      user.currentMatch = null;
    }

    await user.save();

    console.log('✅ User unpinned and frozen');
    res.json({ message: 'Unpinned and frozen' });
  } catch (err) {
    console.error('❌ Server error during unpin:', err.message);
    res.status(500).json({ message: 'Unpin failed', error: err.message });
  }
});


module.exports = router;
