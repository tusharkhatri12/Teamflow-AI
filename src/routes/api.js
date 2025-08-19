const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const StandupMessage = require('../models/StandupMessage');

const standupsPath = path.join(__dirname, '../../data/standups.json');

// GET /messages - returns only normal user messages (MongoDB)
router.get('/messages', async (req, res) => {
  try {
    const docs = await StandupMessage.find({ isSummary: false }).sort({ createdAt: -1 }).limit(500);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

const boardRoute = require('./boardRoute');
// Mount board routes under /api/boards (index mounts this router at /api)
router.use('/boards', boardRoute);


// GET /summaries - returns only summaries by the bot (MongoDB)
router.get('/summaries', async (req, res) => {
  try {
    const docs = await StandupMessage.find({ isSummary: true }).sort({ createdAt: -1 }).limit(200);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load summaries' });
  }
});

// Protected route to get user info
router.get('/protected', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
  
});


module.exports = router;
