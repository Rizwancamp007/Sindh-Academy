const mongoose = require('mongoose');

const VideoAccessLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoId: {
    type: String, // Or ObjectId, depending on standard
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  heartbeats: [
    {
      timestamp: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('VideoAccessLog', VideoAccessLogSchema);
