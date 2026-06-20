const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  answers: {
    type: Map,
    of: String // Maps questionId string to selected option letter (e.g., { "60f78...": "B" })
  },
  flaggedQuestions: [{ type: String }], // Array of questionIds marked for review
  score: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model('Attempt', AttemptSchema);
