// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  gender: String,
  state: { type: String, default: 'available' },
  intentionality: {
    totalMessagesSent: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 },
    lastMessageAt: Date,
  },
  onboarding: {
    loveLanguage: String,
    attachmentStyle: String,
    communicationStyle: String,
    emotionalNeeds: String,
    age: Number,
    values: String,
    personalityType: String,
    goals: String,
  }
}, { timestamps: true });

// ✅ Auto-hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// ✅ Password comparison
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
