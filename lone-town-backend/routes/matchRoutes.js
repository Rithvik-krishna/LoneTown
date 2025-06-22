const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const User = require('../models/User');
const { findMatch } = require("../matchMaking/algorithm");
const MatchQueue = require('../models/MatchQueue');
const { matchUsers } = require("../matchMaking/algorithm");


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


// ✅ Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    res.json(user); // Ideally you'd send a token too
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

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

// 🎯 Find Match Endpoint
router.post('/find-match', async (req, res) => {
  const { userId } = req.body;
  const io = req.app.get("socketio");

  try {
    // 1. Verify user exists and is available
    const user = await User.findById(userId);
    if (!user || user.state !== "available") {
      return res.status(400).json({ error: "User not available" });
    }

    // 2. Create transaction for atomic operations
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 3. Add to queue with session
      await MatchQueue.findOneAndUpdate(
        { userId },
        { $setOnInsert: { userId } },
        { upsert: true, new: true, session }
      );

      // 4. Find matches within transaction
      const matches = await matchUsers(io, session);
      const wasMatched = matches.some(m => 
        m.userA.equals(userId) || m.userB.equals(userId)
      );

      await session.commitTransaction();

      if (wasMatched) {
        return res.json({ 
          status: "matched",
          message: "Match found!" 
        });
      }

      res.json({
        status: "searching",
        position: await MatchQueue.countDocuments(),
        message: "Searching for compatible matches..."
      });

    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

  } catch (err) {
    console.error("❌ Match error:", err);
    res.status(500).json({ 
      error: "Matchmaking failed",
      details: err.message 
    });
  }
});

// 🛑 Cancel Search
router.post('/cancel-search', async (req, res) => {
  const { userId } = req.body;
  const io = req.app.get("socketio");

  try {
    await MatchQueue.deleteOne({ userId });
    
    // Notify user
    if (io) {
      io.to(userId).emit("searchCancelled");
    }

    res.json({ 
      success: true,
      message: "Search cancelled" 
    });

  } catch (err) {
    res.status(500).json({ 
      error: "Cancellation failed",
      details: err.message 
    });
  }
});

// 📊 Debug Endpoint
router.get('/debug', async (req, res) => {
  try {
    const queue = await MatchQueue.find().populate('user');
    const users = await User.find({
      state: "available"
    }).select("name state");

    res.json({
      queue,
      availableUsers: users,
      queueCount: queue.length
    });

  } catch (err) {
    res.status(500).json({ 
      error: "Debug failed",
      details: err.message 
    });
  }
});

// In matchRoutes.js
router.get("/verify/:matchId", async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId)
      .populate("users", "name avatar");
    
    if (!match) return res.json({ valid: false });

    // Check both users still reference this match
    const users = await User.countDocuments({
      _id: { $in: match.users },
      currentMatch: match._id
    });

    res.json({
      valid: users === 2,
      match
    });
  } catch (err) {
    res.status(500).json({ valid: false });
  }
});

router.post('/confirm-match', async (req, res) => {
  const { matchId } = req.body;
  const io = req.app.get("socketio");

  try {
    // 1. Verify match exists and is still valid
    const match = await Match.findById(matchId)
      .populate('users', 'state currentMatch');
    
    if (!match || match.users.some(u => u.currentMatch.toString() !== matchId)) {
      return res.status(410).json({ error: "Match no longer valid" });
    }

    // 2. Finalize match (prevent rollback)
    await Match.findByIdAndUpdate(matchId, { 
      status: 'confirmed',
      confirmedAt: new Date() 
    });

    // 3. Emit finalized event
    match.users.forEach(user => {
      io.to(user._id.toString()).emit("matchFinalized", {
        matchId,
        partner: match.users.find(u => u._id.toString() !== user._id.toString())
      });
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Confirmation failed" });
  }
});

module.exports = router;
