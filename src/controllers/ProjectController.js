const Project = require('../models/Projects');
const Board = require('../models/Board');

exports.listProjects = async (req, res) => {
  try {
    const { orgId } = req.params;
    if (String(req.user?.organization?._id || req.user?.organization) !== String(orgId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const items = await Project.find({ orgId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { name, description, icon } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });
    if (String(req.user?.organization?._id || req.user?.organization) !== String(orgId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const proj = await Project.create({ orgId, name, description, icon });
    // Create an empty board for the project
    const board = await Board.create({ orgId, projectId: proj._id, projectName: name, name: `${name} Board`, sprints: [], columns: [], tasks: [] });
    res.status(201).json({ project: proj, board });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


