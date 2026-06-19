const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true // e.g. "CHALLAN_VERIFY", "LECTURE_DELETE"
  },
  targetModel: {
    type: String,
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  changeDelta: {
    type: Object, // Stores previous state vs new state differential
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
