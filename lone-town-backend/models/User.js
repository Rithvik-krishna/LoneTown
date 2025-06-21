// models/User.js
const mongoose = require('mongoose');

const intentionalitySchema = new mongoose.Schema({
  loginCount: { type: Number, default: 0 },
  totalMessagesSent: { type: Number, default: 0 },
  averageResponseTime: { type: Number, default: 0 },
  pinCount: { type: Number, default: 0 },
  unpinCount: { type: Number, default: 0 },
  lastMessageAt: { type: Date }
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  gender: String,
  state: { type: String, default: 'available' }, // available, matched, pinned, frozen
  freezeUntil: Date,
  currentMatch: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', default: null },
  intentionality: { type: intentionalitySchema, default: () => ({}) },
  loveLanguage: String,
  attachmentStyle: String,
  communicationStyle: String,
  emotionalNeeds: String,
  age: String,
  lastUnmatchedAt: {
  type: Date,
  loveLanguage: String,
attachmentStyle: String,
communicationStyle: String,
emotionalNeeds: String,
age: Number,
values: String,
personalityType: String,
goals: String,

}

});

module.exports = mongoose.model('User', userSchema);
