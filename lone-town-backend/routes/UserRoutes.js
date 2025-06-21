const express = require('express');
const router = express.Router();
const User = require('../models/User');


router.post('/login', async (req, res) => {
  console.log('👉 Received body:', req.body); // ✅ debug log

  try {
    const { email, name, gender } = req.body;

    if (!email || !name || !gender) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, name, gender });
      await user.save();
    }

    res.json(user);
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit onboarding traits
router.post('/onboarding/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(user);
});

// ✅ PIN
router.post('/pin', async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  user.state = 'pinned';
  user.intentionality.pinCount += 1;
  await user.save();
  res.json({ message: 'Pinned' });
});

// ✅ UNPIN
router.post('/unpin', async (req, res) => {
  const { userId, matchId } = req.body;
  const freezeUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await User.findByIdAndUpdate(userId, {
    state: 'frozen',
    freezeUntil,
    currentMatch: null,
    $inc: { 'intentionality.unpinCount': 1 }
  });

  const match = await Match.findById(matchId).populate('users');
  const otherUserId = match.users.find((id) => id.toString() !== userId);

  if (otherUserId) {
    await User.findByIdAndUpdate(otherUserId, {
      state: 'available',
      currentMatch: null,
    });
  }

  res.status(200).json({ message: 'Unpinned. Freeze started.' });
});

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});


// 🔍 Analytics endpoint
router.get('/analytics/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user.intentionality);
});

module.exports = router;