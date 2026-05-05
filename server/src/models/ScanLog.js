const mongoose = require('mongoose');

const ScanLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  guestSessionId: { type: String, required: false },
  inputType: { type: String, enum: ['email','url','attachment'], required: true },
  raw: { type: String },
  result: { type: String, enum: ['phishing','legitimate','unknown'], default: 'unknown' },
  riskScore: { type: Number, default: 0 },
  meta: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('ScanLog', ScanLogSchema);
