// backend/models/Board.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const TaskSchema = new mongoose.Schema({
  _id: { type: String },
  title: String,
  description: String,
  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sprintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint', default: null },
  labels: [{ type: String }],
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [CommentSchema],
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const ColumnSchema = new mongoose.Schema({
  id: { type: String, required: true }, // short unique string
  title: { type: String, required: true },
  taskIds: [{ type: String }] // array of Task._id
}, { _id: false });

const BoardSchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
  projectName: { type: String },
  name: { type: String, default: 'Main Board' },
  sprints: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    active: { type: Boolean, default: false },
  }],
  columns: [ColumnSchema],
  tasks: [TaskSchema], // embedded tasks
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Board', BoardSchema);
