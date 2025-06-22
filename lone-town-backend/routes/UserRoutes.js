const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// SIGNUP ✅
// routes/UserRoutes.js
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, gender } = req.body;

    if (!name || !email || !password || !gender)
      return res.status(400).json({ error: 'All fields are required' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: 'Email already in use' });

    const user = new User({ name, email, password, gender }); // 🔒 password auto-hashed here
    await user.save();

    const userData = user.toObject();
    delete userData.password;

    res.status(201).json(userData);
  } catch (err) {
    console.error('❌ Signup error:', err.message);
    res.status(500).json({ error: 'Signup failed' });
  }
});


//LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login payload:', req.body);

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

    const userData = user.toObject();
    delete userData.password;

    res.status(200).json(userData);
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});




// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
try {
const { email } = req.body;
const user = await User.findOne({ email });
if (!user) return res.status(404).json({ error: 'User not found' });


const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: user.email,
  subject: 'Reset your Lone Town password',
  html: `<p>Click below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
});

res.json({ message: 'Reset link sent to email' });
} catch (err) {
console.error('Forgot password error:', err);
res.status(500).json({ error: 'Failed to send reset email' });
}
});

// RESET PASSWORD
router.post('/reset-password/:token', async (req, res) => {
try {
const { token } = req.params;
const { password } = req.body;
const decoded = jwt.verify(token, process.env.JWT_SECRET);


const user = await User.findById(decoded.id);
if (!user) return res.status(404).json({ error: 'User not found' });

user.password = await bcrypt.hash(password, 10);
await user.save();

res.json({ message: 'Password reset successful' });
} catch (err) {
console.error('Reset password error:', err);
res.status(500).json({ error: 'Password reset failed' });
}
});


// ✅ Save onboarding data for a user
router.post('/onboarding/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const onboardingData = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { onboarding: onboardingData }, // save under "onboarding" field
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Onboarding data saved' });
  } catch (err) {
    console.error('❌ Onboarding error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET USER (on app reload)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); // omit password
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;