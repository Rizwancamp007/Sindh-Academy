const mongoose = require('mongoose');

const ChallanSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challanNumber: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    default: 5000
  },
  planName: {
    type: String,
    enum: ['coaching', 'mdcat/ecat'],
    default: 'mdcat/ecat'
  },
  details: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['generated', 'uploaded', 'verified', 'rejected'],
    default: 'generated'
  },
  receiptImage: {
    type: String, // local path to stored file
    default: null
  },
  transactionId: {
    type: String,
    default: null
  },
  uploadedAt: {
    type: Date
  },
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Challan', ChallanSchema);
