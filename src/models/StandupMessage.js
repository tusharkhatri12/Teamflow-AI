const mongoose = require('mongoose');

const StandupMessageSchema = new mongoose.Schema({
  user: { type: String, required: true }, // Slack user ID or 'StandupBot'
  message: { type: String, required: true },
  channel: { type: String },
  isSummary: { type: Boolean, default: false },
  metadata: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('StandupMessage', StandupMessageSchema);


