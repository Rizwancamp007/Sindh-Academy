const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: [arrayLimit, 'Must have at least 2 and at most 5 options']
  },
  correctOption: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: true
  },
  explanation: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    required: true,
    index: true
  },
  topic: {
    type: String,
    required: true,
    index: true
  },
  tags: {
    type: [String],
    default: []
  },
  isDemo: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

function arrayLimit(val) {
  return val.length >= 2 && val.length <= 5;
}

// Global text index for high-speed MCQs bank query
QuestionSchema.index({
  questionText: 'text',
  topic: 'text',
  explanation: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Question', QuestionSchema);
