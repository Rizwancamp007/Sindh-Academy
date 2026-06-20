const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  subject: {
    type: String,
    default: "Full Syllabus"
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    }
  ],
  durationMinutes: {
    type: Number, // in minutes
    required: true,
    default: 150 // Default to 150 mins for 200 questions
  },
  isDemo: {
    type: Boolean,
    default: false
  },
  isMonthly: {
    type: Boolean,
    default: false
  },
  windowOpen: {
    type: Date,
    required: true
  },
  windowClose: {
    type: Date,
    required: true
  },
  negativeMarking: {
    type: Boolean,
    default: false
  },
  externalDocLink: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Exam', ExamSchema);
