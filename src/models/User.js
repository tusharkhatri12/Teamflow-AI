const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Not required for Google users
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  googleId: { type: String },
  // Slack connection
  slackUserId: { type: String, default: null },
  slackConnected: { type: Boolean, default: false },
  slackChannels: { type: [String], default: [] },
  // Forgot password fields
  resetPasswordOtp: { type: String },
  resetPasswordOtpExpiry: { type: Date },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationOtp: { type: String },
  emailVerificationOtpExpiry: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema); 