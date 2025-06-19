const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  userA: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userB: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  pinned: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  messages: [{ text: String, timestamp: Date }],
  messageCount: { type: Number, default: 0 },
});

module.exports = mongoose.model("Match", matchSchema);