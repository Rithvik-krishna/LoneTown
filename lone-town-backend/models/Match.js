const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  userA: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userB: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  pinned: { type: Boolean, default: true },
  messages: [{ text: String, timestamp: Date }],
  messageCount: { type: Number, default: 0 },
  feedback: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: Number,
      comment: String,
      createdAt: Date,
    },
  ],
}, { timestamps: true }); 


module.exports = mongoose.model("Match", matchSchema);