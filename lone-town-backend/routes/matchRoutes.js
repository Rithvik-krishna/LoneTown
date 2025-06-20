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

// routes/matchRoutes.js
router.post('/find-match', async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  const candidates = await User.find({ _id: { $ne: userId }, state: 'available' });

  let bestMatch = null;
  let highestScore = 0;

  for (const candidate of candidates) {
    let score = 0;
    if (candidate.loveLanguage === user.loveLanguage) score += 2;
    if (candidate.attachmentStyle === user.attachmentStyle) score += 2;
    if (candidate.communicationStyle === user.communicationStyle) score += 1;
    if (
      candidate.emotionalNeeds &&
      user.emotionalNeeds &&
      candidate.emotionalNeeds.includes(user.emotionalNeeds)
    ) score += 2;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = candidate;
    }
  }

  if (bestMatch) {
    // mark both users as matched
    user.state = 'pinned';
    bestMatch.state = 'pinned';
    await user.save();
    await bestMatch.save();

    res.json({ match: bestMatch });
  } else {
    res.json({ message: "No match found" });
  }
});


// 🤖 Deep Compatibility Match Finder
router.post('/find-match', async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const candidates = await User.find({ _id: { $ne: userId }, state: 'available' });

    let bestMatch = null;
    let highestScore = 0;

    for (const candidate of candidates) {
      let score = 0;
      if (candidate.loveLanguage === user.loveLanguage) score += 2;
      if (candidate.attachmentStyle === user.attachmentStyle) score += 2;
      if (candidate.communicationStyle === user.communicationStyle) score += 1;
      if (
        candidate.emotionalNeeds &&
        user.emotionalNeeds &&
        candidate.emotionalNeeds.includes(user.emotionalNeeds)
      ) score += 2;

      if (score > highestScore) {
        highestScore = score;
        bestMatch = candidate;
      }
    }

    if (bestMatch) {
      user.state = 'pinned';
      bestMatch.state = 'pinned';
      await user.save();
      await bestMatch.save();

      return res.json({ match: bestMatch });
    }

    res.status(200).json({ message: 'No match found' });
  } catch (err) {
    console.error('❌ Matchmaking error:', err.message);
    res.status(500).json({ message: 'Matchmaking failed' });
  }
});

// POST /api/match/feedback
router.post('/feedback', async (req, res) => {
  try {
    const { userId, matchId, rating, comment } = req.body;

    // ✅ Skip dummy matches
    if (!matchId || matchId === 'debug-match') {
      return res.status(200).json({ message: 'Dummy match - skipping save.' });
    }

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ error: "Match not found" });

    match.feedback = match.feedback || [];
    match.feedback.push({ userId, rating, comment, createdAt: new Date() });

    await match.save();
    res.status(200).json({ message: "Feedback saved" });
  } catch (err) {
    console.error("❌ Feedback error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;
