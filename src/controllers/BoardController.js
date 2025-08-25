// backend/controllers/boardController.js
const Board = require('../models/Board');
const { nanoid } = require('nanoid'); // npm i nanoid
const axios = require('axios');

async function callLLM(prompt) {
  // Prefer Groq
  if (process.env.GROQ_API_KEY) {
    try {
      const resp = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: 'You produce concise, helpful outputs.' },
          { role: 'user', content: prompt }
        ]
      }, {
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }
      });
      return resp.data.choices?.[0]?.message?.content?.trim();
    } catch {}
  }
  // Fall back to OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const resp = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You produce concise, helpful outputs.' },
          { role: 'user', content: prompt }
        ]
      });
      return resp.choices?.[0]?.message?.content?.trim();
    } catch {}
  }
  return null;
}

// Get board by orgId (and optional projectId), optionally filtered by assigneeId
exports.getBoardByOrg = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { assigneeId, sprintId, projectId } = req.query;
    const userOrgId = req.user?.organization?._id || req.user?.organization;
    if (String(userOrgId) !== String(orgId)) {
      return res.status(403).json({ message: 'Forbidden: Not a member of this organization' });
    }

    const findQuery = { orgId };
    if (projectId) findQuery.projectId = projectId;
    const board = await Board.findOne(findQuery);
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
    const { orgId, name, projectId, projectName } = req.body;
    if (!orgId) {
      return res.status(400).json({ message: 'orgId is required' });
    }

    // If a board already exists for this org, return it
    const existing = await Board.findOne({ orgId, ...(projectId ? { projectId } : {}) });
    if (existing) {
      return res.status(200).json(existing);
    }

    // create with default columns matching desired statuses
    const defaultColumns = [
      { id: nanoid(6), title: 'New', taskIds: [] },
      { id: nanoid(6), title: 'In Progress', taskIds: [] },
      { id: nanoid(6), title: 'Moved to QA', taskIds: [] },
      { id: nanoid(6), title: 'Done', taskIds: [] },
      { id: nanoid(6), title: 'Reported', taskIds: [] }
    ];

    const board = new Board({
      orgId,
      projectId: projectId || undefined,
      projectName: projectName || undefined,
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
      dueDate: dueDate ? new Date(dueDate) : null,
      createdBy: req.user?._id
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

// List all tasks for a project (across its board)
exports.listProjectTasks = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { projectId, sprintId } = req.query;
    const userOrgId = req.user?.organization?._id || req.user?.organization;
    if (String(userOrgId) !== String(orgId)) return res.status(403).json({ message: 'Forbidden' });
    const board = await Board.findOne({ orgId, ...(projectId ? { projectId } : {}) });
    if (!board) return res.json({ tasks: [] });
    const tasks = (board.tasks || []).filter(t => sprintId ? String(t.sprintId || '') === String(sprintId) : true);
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// AI: Suggest sprint goals from tasks (optionally for active sprint)
exports.suggestGoals = async (req, res) => {
  try {
    const { boardId } = req.params;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    const userOrgId = req.user?.organization?._id || req.user?.organization;
    if (String(board.orgId) !== String(userOrgId)) return res.status(403).json({ message: 'Forbidden' });

    const activeSprint = board.sprints?.find(s => s.active);
    const tasks = board.tasks.filter(t => !activeSprint ? true : String(t.sprintId || '') === String(activeSprint._id || ''));
    const taskLines = tasks.map(t => `- [${t.priority}] ${t.title}${t.labels?.length ? ` (${t.labels.join(', ')})` : ''}`).join('\n');
    const prompt = `You are an agile coach. Given the following tasks, propose 3-5 concise sprint goals (bullet list). Keep goals outcome-oriented, not task lists.\n\nTasks:\n${taskLines}\n\nSprint goals:`;

    const content = await callLLM(prompt);
    if (!content) {
      // naive fallback: pick top priorities
      const top = tasks.filter(t => t.priority === 'high').slice(0, 5).map(t => `Deliver: ${t.title}`);
      return res.json({ goals: top.length ? top : ['Improve delivery of top priorities', 'Reduce blockers', 'Ship at least one customer-visible improvement'] });
    }
    const goals = content.split('\n').map(l => l.replace(/^[-*]\s?/, '').trim()).filter(Boolean);
    return res.json({ goals });
  } catch (err) {
    res.status(500).json({ message: 'Failed to suggest goals' });
  }
};

// AI: Summarize sprint progress
exports.summarizeProgress = async (req, res) => {
  try {
    const { boardId } = req.params;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    const userOrgId = req.user?.organization?._id || req.user?.organization;
    if (String(board.orgId) !== String(userOrgId)) return res.status(403).json({ message: 'Forbidden' });

    const cols = board.columns;
    const counts = Object.fromEntries(cols.map(c => [c.title, c.taskIds.length]));
    const tasksMap = new Map(board.tasks.map(t => [t._id, t]));
    const doneTasks = (cols.find(c => c.title === 'Done')?.taskIds || []).map(id => tasksMap.get(id)?.title).filter(Boolean);
    const inProgress = (cols.find(c => c.title === 'In Progress')?.taskIds || []).map(id => tasksMap.get(id)?.title).filter(Boolean);
    const prompt = `Summarize sprint progress in 3-6 concise bullets. Mention totals per column and highlight recently completed work.\n\nCounts per column: ${JSON.stringify(counts)}\nDone: ${doneTasks.join('; ')}\nIn Progress: ${inProgress.join('; ')}`;
    const content = await callLLM(prompt);
    if (!content) {
      const bullets = [
        `Done: ${counts['Done'] || 0} tasks`,
        `In Progress: ${counts['In Progress'] || 0} tasks`,
        `New: ${counts['New'] || 0}, QA: ${counts['Moved to QA'] || 0}, Reported: ${counts['Reported'] || 0}`
      ];
      return res.json({ summary: bullets.join('\n') });
    }
    return res.json({ summary: content });
  } catch (err) {
    res.status(500).json({ message: 'Failed to summarize progress' });
  }
};
