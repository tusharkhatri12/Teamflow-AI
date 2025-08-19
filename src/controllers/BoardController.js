// backend/controllers/boardController.js
const Board = require('../models/Board');
const { nanoid } = require('nanoid'); // npm i nanoid

// Get board by orgId
exports.getBoardByOrg = async (req, res) => {
  try {
    const { orgId } = req.params;
    const board = await Board.findOne({ orgId });
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.json(board);
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
    const { columnId, title, description, assigneeId, dueDate } = req.body;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const taskId = nanoid(10);
    const task = {
      _id: taskId,
      title,
      description: description || '',
      assigneeId: assigneeId || null,
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

    const task = board.tasks.find(t => t._id === taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

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

    // remove from source
    const sourceCol = board.columns.find(c => c.id === source.droppableId);
    sourceCol.taskIds.splice(source.index, 1);

    if (!destination) {
      // dropped outside any column -> just save removal
      await board.save();
      return res.json(board);
    }

    const destCol = board.columns.find(c => c.id === destination.droppableId);
    destCol.taskIds.splice(destination.index, 0, draggableId);

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
