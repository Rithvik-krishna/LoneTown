const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now, // ✅ Auto add timestamp
  },
  matchId: String,
  senderId: String,
  text: String,
}, { timestamps: true  // ✅ this includes createdAt

});

module.exports = mongoose.model('Message', messageSchema);
