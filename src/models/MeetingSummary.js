const mongoose = require('mongoose');

const MeetingSummarySchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  title: { type: String, required: true },
  transcript: { type: String, required: true },
  summary: {
    keyPoints: { type: [String], default: [] },
    decisions: { type: [String], default: [] },
    actionItems: { type: [String], default: [] },
    risks: { type: [String], default: [] }
  }
}, { timestamps: true });

module.exports = mongoose.model('MeetingSummary', MeetingSummarySchema);
