// backend/models/Board.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  _id: { type: String }, // we'll generate client-side ids or use mongoose.Types.ObjectId().toString()
  title: String,
  description: String,
  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  dueDate: Date,
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const ColumnSchema = new mongoose.Schema({
  id: { type: String, required: true }, // short unique string
  title: { type: String, required: true },
  taskIds: [{ type: String }] // array of Task._id
}, { _id: false });

const BoardSchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, default: 'Main Board' },
  columns: [ColumnSchema],
  tasks: [TaskSchema], // embedded tasks
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Board', BoardSchema);
