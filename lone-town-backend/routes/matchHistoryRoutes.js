const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const User = require('../models/User');

// 🧠 GET Past Matches with Feedback for a user
router.get('/history/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // 1. Find all matches where the user was involved
    const matches = await Match.find({ users: userId })
      .populate('users', 'name') // get names
      .sort({ createdAt: -1 });

    // 2. Format matches
    const formatted = matches.map((match) => {
      const partner = match.users.find(u => u._id.toString() !== userId);
      const feedback = match.feedback || [];

      const userFeedback = feedback.find(f => f.userId.toString() === userId);
      const partnerFeedback = feedback.find(f => f.userId.toString() !== userId);

      return {
        matchId: match._id,
        partnerName: partner?.name || 'Unknown',
        compatibilityScore: match.compatibilityScore || 0,
        userFeedback: userFeedback?.text || null,
        partnerFeedback: partnerFeedback?.text || null,
        createdAt: match.createdAt
      };
    });

    res.json({ history: formatted });
  } catch (err) {
    console.error('❌ Failed to fetch match history:', err.message);
    res.status(500).json({ error: 'Failed to fetch match history' });
  }
});

module.exports = router;
