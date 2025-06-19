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
    enum: ["available", "matched", "frozen"],
    default: "available",
  },
  currentMatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
    default: null,
  },
  freezeUntil: Date,
});

module.exports = mongoose.model("User", userSchema);