const mongoose = require("mongoose");

const matchQueueSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true,
    unique: true,
    index: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 86400 // 24h TTL
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true } 
});

// Virtual population
matchQueueSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Index for faster matching
matchQueueSchema.index({ createdAt: 1 });
matchQueueSchema.index({ priority: -1 });

const MatchQueue = mongoose.model("MatchQueue", matchQueueSchema);

module.exports = MatchQueue;