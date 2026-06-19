const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, 'Please add student name'],
    trim: true
  },
  achievement: {
    type: String,
    required: [true, 'Please add achievement badge or score'],
    trim: true
  },
  reviewText: {
    type: String,
    required: [true, 'Please add success review content'],
    trim: true
  },
  avatarName: {
    type: String,
    default: 'avatar1'
  },
  isFeatured: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
