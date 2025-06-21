const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  compatibilityScore: Number,
  feedback: {
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    submittedAt: Date,
  }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
