const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  orgName: { type: String, required: true },
  joinCode: { type: String, required: true, unique: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Organization', OrganizationSchema);
