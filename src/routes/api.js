const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const standupsPath = path.join(__dirname, '../../data/standups.json');

// GET /messages - returns only normal user messages
router.get('/messages', (req, res) => {
  try {
    const data = fs.readFileSync(standupsPath, 'utf8');
    const messages = JSON.parse(data);

    const userMessages = messages.filter(msg => {
      return !msg.message.startsWith(':memo: *Conversation Summary:*');
    });

    res.json(userMessages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// GET /summaries - returns only summaries by the bot
router.get('/summaries', (req, res) => {
  try {
    const data = fs.readFileSync(standupsPath, 'utf8');
    const messages = JSON.parse(data);

    const summaries = messages.filter(msg => 
      msg.message.startsWith(':memo: *Conversation Summary:*')
    );

    res.json(summaries);
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
