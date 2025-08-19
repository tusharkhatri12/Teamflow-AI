// backend/controllers/boardController.js
const Board = require('../models/Board');
const { nanoid } = require('nanoid'); // npm i nanoid

// Get board by orgId, optionally filtered by assigneeId
exports.getBoardByOrg = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { assigneeId, sprintId } = req.query;
    const userOrgId = req.user?.organization?._id || req.user?.organization;
    if (String(userOrgId) !== String(orgId)) {
      return res.status(403).json({ message: 'Forbidden: Not a member of this organization' });
    }

    const board = await Board.findOne({ orgId });
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'owner';
    const effectiveAssignee = isAdmin ? assigneeId : (req.user?._id?.toString());
    if (!effectiveAssignee && !sprintId) {
      return res.json(board);
    }

    // Filter tasks by assignee and adjust columns' taskIds accordingly
    const allowedTaskIds = new Set(
      board.tasks
        .filter(t => {
          const assigneePass = effectiveAssignee ? String(t.assigneeId || '') === String(effectiveAssignee) : true;
          const sprintPass = sprintId ? String(t.sprintId || '') === String(sprintId) : true;
          return assigneePass && sprintPass;
        })
        .map(t => t._id)
    );

    const filtered = board.toObject();
    filtered.tasks = filtered.tasks.filter(t => allowedTaskIds.has(t._id));
    filtered.columns = filtered.columns.map(col => ({
      ...col,
      taskIds: col.taskIds.filter(id => allowedTaskIds.has(id))
    }));

    return res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create default board for org (idempotent: returns existing if present)
exports.createBoard = async (req, res) => {
  try {
    const { orgId, name } = req.body;
    if (!orgId) {
      return res.status(400).json({ message: 'orgId is required' });
    }

    // If a board already exists for this org, return it
    const existing = await Board.findOne({ orgId });
    if (existing) {
      return res.status(200).json(existing);
    }

    // create with default columns
    const defaultColumns = [
      { id: nanoid(6), title: 'To Do', taskIds: [] },
      { id: nanoid(6), title: 'In Progress', taskIds: [] },
      { id: nanoid(6), title: 'Done', taskIds: [] }
    ];

    const board = new Board({
      orgId,
      name: name || 'Main Board',
      sprints: [],
      columns: defaultColumns,
      tasks: []
    });
    await board.save();
    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add column
exports.addColumn = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title } = req.body;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    const id = nanoid(6);
    board.columns.push({ id, title, taskIds: [] });
    await board.save();
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add task to a column
exports.addTask = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { columnId, title, description, assigneeId, dueDate, sprintId, labels = [], priority = 'medium' } = req.body;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const userOrgId = req.user?.organization?._id || req.user?.organization;
    if (String(board.orgId) !== String(userOrgId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const taskId = nanoid(10);
    const task = {
      _id: taskId,
      title,
      description: description || '',
      assigneeId: (req.user?.role === 'admin' || req.user?.role === 'owner')
        ? (assigneeId || req.user._id)
        : req.user._id,
      sprintId: sprintId || null,
      labels,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null
    };
    board.tasks.push(task);

    const col = board.columns.find(c => c.id === columnId);
    if (!col) return res.status(400).json({ message: 'Column not found' });
    col.taskIds.unshift(taskId); // add to top
    await board.save();
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update task (title/desc/assignee/due)
exports.updateTask = async (req, res) => {
  try {
    const { boardId, taskId } = req.params;
    const updates = req.body;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const userOrgId = req.user?.organization?._id || req.user?.organization;
    if (String(board.orgId) !== String(userOrgId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const task = board.tasks.find(t => t._id === taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Non-admins cannot reassign tasks to others
    if (req.user?.role !== 'admin' && req.user?.role !== 'owner') {
      if (updates.assigneeId && String(updates.assigneeId) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Forbidden: cannot reassign task' });
      }
    }

    Object.assign(task, updates);
    await board.save();
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const { boardId, taskId } = req.params;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const userOrgId = req.user?.organization?._id || req.user?.organization;
    if (String(board.orgId) !== String(userOrgId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    board.tasks = board.tasks.filter(t => t._id !== taskId);
    board.columns.forEach(c => { c.taskIds = c.taskIds.filter(id => id !== taskId); });
    await board.save();
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Move handler (drag end). Payload contains source/destination info.
exports.moveTask = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { source, destination, draggableId } = req.body;
    // source = { droppableId: columnId, index }, destination similar or null (dropped outside)
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const userOrgId = req.user?.organization?._id || req.user?.organization;
    if (String(board.orgId) !== String(userOrgId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // remove from source
    const sourceCol = board.columns.find(c => c.id === source.droppableId);
    const removeIndex = sourceCol.taskIds.indexOf(draggableId);
    if (removeIndex !== -1) {
      sourceCol.taskIds.splice(removeIndex, 1);
    }

    if (!destination) {
      // dropped outside any column -> just save removal
      await board.save();
      return res.json(board);
    }

    const destCol = board.columns.find(c => c.id === destination.droppableId);
    const insertIndex = Math.max(0, Math.min(destination.index ?? destCol.taskIds.length, destCol.taskIds.length));
    destCol.taskIds.splice(insertIndex, 0, draggableId);

    await board.save();
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reorder columns (drag columns) - optional
exports.reorderColumns = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { sourceIndex, destIndex } = req.body;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    const [col] = board.columns.splice(sourceIndex, 1);
    board.columns.splice(destIndex, 0, col);
    await board.save();
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Sprints
exports.createSprint = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { name, startDate, endDate, active } = req.body;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    const userOrgId = req.user?.organization?._id || req.user?.organization;
    if (String(board.orgId) !== String(userOrgId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const sprint = { _id: new (require('mongoose').Types.ObjectId)(), name, startDate, endDate, active: !!active };
    if (active) {
      board.sprints.forEach(s => s.active = false);
    }
    board.sprints.push(sprint);
    await board.save();
    res.status(201).json(sprint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listSprints = async (req, res) => {
  try {
    const { boardId } = req.params;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    const userOrgId = req.user?.organization?._id || req.user?.organization;
    if (String(board.orgId) !== String(userOrgId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(board.sprints || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSprint = async (req, res) => {
  try {
    const { boardId, sprintId } = req.params;
    const updates = req.body;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    const userOrgId = req.user?.organization?._id || req.user?.organization;
    if (String(board.orgId) !== String(userOrgId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const sprint = board.sprints.id(sprintId);
    if (!sprint) return res.status(404).json({ message: 'Sprint not found' });
    if (updates.active === true) {
      board.sprints.forEach(s => s.active = false);
    }
    Object.assign(sprint, updates);
    await board.save();
    res.json(sprint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Comments
exports.addComment = async (req, res) => {
  try {
    const { boardId, taskId } = req.params;
    const { text } = req.body;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    const userOrgId = req.user?.organization?._id || req.user?.organization;
    if (String(board.orgId) !== String(userOrgId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const task = board.tasks.find(t => t._id === taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const comment = {
      id: require('nanoid').nanoid(10),
      authorId: req.user._id,
      text,
      createdAt: new Date()
    };
    task.comments = task.comments || [];
    task.comments.push(comment);
    await board.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { boardId, taskId, commentId } = req.params;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    const userOrgId = req.user?.organization?._id || req.user?.organization;
    if (String(board.orgId) !== String(userOrgId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const task = board.tasks.find(t => t._id === taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.comments = (task.comments || []).filter(c => c.id !== commentId);
    await board.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
