const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  gender: String,
  state: { type: String, default: "available" },
  freezeUntil: Date,
  currentMatch: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },

  // Onboarding
  loveLanguage: String,
  attachmentStyle: String,
  communicationStyle: String,
  emotionalNeeds: String,
  age: Number,

  // ✅ Intentionality tracking
  intentionality: {
    loginCount: { type: Number, default: 0 },
    totalMessagesSent: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 }, // seconds
    lastMessageAt: { type: Date },
    pinCount: { type: Number, default: 0 },
    unpinCount: { type: Number, default: 0 },
  }
});

module.exports = mongoose.model("User", userSchema);
