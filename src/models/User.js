const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Not required for Google users
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  googleId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema); 