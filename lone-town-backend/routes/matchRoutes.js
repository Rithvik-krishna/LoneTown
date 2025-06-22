const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const User = require('../models/User');

// ✨ Compatibility Scoring Function
function calculateCompatibility(u1, u2) {
  let score = 0;
  if (u1.loveLanguage === u2.loveLanguage) score += 2;
  if (u1.attachmentStyle === u2.attachmentStyle) score += 2;
  if (u1.communicationStyle === u2.communicationStyle) score += 1;
  if (
    u1.emotionalNeeds &&
    u2.emotionalNeeds &&
    u1.emotionalNeeds.toLowerCase().includes(u2.emotionalNeeds.toLowerCase())
  ) score += 1;

  const ageDiff = Math.abs((u1.age || 0) - (u2.age || 0));
  if (ageDiff <= 3) score += 2;
  else if (ageDiff <= 6) score += 1;

  return score;
}

// ✅ FIND MATCH with optional real-time emit
router.post('/find-match', async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.state !== "available" || user.currentMatch) {
      return res.status(400).json({ message: "User not eligible for match" });
    }

    const candidates = await User.find({
      _id: { $ne: userId },
      state: 'available',
      currentMatch: null,
    });

    const scored = candidates.map((other) => ({
      user: other,
      score: calculateCompatibility(user, other),
    })).sort((a, b) => b.score - a.score);

    if (scored.length === 0 || scored[0].score < 3) {
      return res.json({ message: "No compatible match found" });
    }

    const bestMatch = scored[0].user;

    // Update user states
    user.state = 'matched';
    bestMatch.state = 'matched';
    user.currentMatch = bestMatch._id;
    bestMatch.currentMatch = user._id;
    await user.save();
    await bestMatch.save();

    // Create match document
    const match = await Match.create({
      users: [userId, bestMatch._id],
      compatibilityScore: scored[0].score,
    });

    // ✅ Emit matchFound event if socket.io is available
    const io = req.app.get("socketio");
    if (io) {
      io.to(user._id.toString()).emit("matchFound", {
        match: {
          _id: match._id,
          name: bestMatch.name,
          compatibilityScore: scored[0].score,
        },
      });
      io.to(bestMatch._id.toString()).emit("matchFound", {
        match: {
          _id: match._id,
          name: user.name,
          compatibilityScore: scored[0].score,
        },
      });
    }

    // Return response to client
    res.json({
      match: {
        _id: match._id,
        name: bestMatch.name,
        compatibilityScore: scored[0].score,
      },
    });
  } catch (err) {
    console.error("❌ Matchmaking Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

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
router.post('/unpin', async (req, res) => {
  const { userId } = req.body;
  const freezeUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.state = 'frozen';
    user.freezeUntil = freezeUntil;
    user.currentMatch = null;
    user.lastUnmatchedAt = new Date();

    await user.save();
    res.json({ message: 'Unpinned and frozen' });
  } catch (err) {
    res.status(500).json({ message: 'Unpin failed', error: err.message });
  }
});

// ✅ SUBMIT FEEDBACK
router.post('/feedback', async (req, res) => {
  const { userId, matchId, rating, comment } = req.body;

  try {
    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    match.feedback.push({
      userId,
      rating,
      comment,
      createdAt: new Date(),
    });

    await match.save();
    res.json({ message: 'Feedback submitted!' });
  } catch (err) {
    console.error("❌ Feedback Error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
