const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  gender: String,
  email: String,
  compatibilityTraits: {
    emotionalIntelligence: Number,
    introvertExtrovert: Number,
    values: [String],
    lifestyle: String,
  },
  state: {
  type: String,
  enum: ['available', 'matched', 'pinned', 'frozen'],
  default: 'available',
},

freezeUntil: Date, // optional for frozen state

   // 🧠 Onboarding traits
  loveLanguage: String,
  attachmentStyle: String,
  communicationStyle: String,
  emotionalNeeds: String,

  
  currentMatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
    default: null,
  },
  freezeUntil: Date,
});

module.exports = mongoose.model("User", userSchema);