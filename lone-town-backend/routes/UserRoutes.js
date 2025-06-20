const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create or login user
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

// GET user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error("❌ Fetch user error:", err.message);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
