const express = require('express');
require('dotenv').config();
const { storeMessage } = require('../services/summaryService');

const router = express.Router();

router.post('/', async (req, res) => {
  const { type, challenge, event } = req.body;

  // Slack URL verification
  if (type === 'url_verification') {
    return res.status(200).json({ challenge });
  }

  // Listen to messages
  if (type === 'event_callback') {
    if (event && event.type === 'message' && !event.subtype) {
      const text = event.text;
      const user = event.user;

      storeMessage({ user, text, timestamp: Date.now() });
      console.log('📥 Message stored:', text);
    }
  }

  res.sendStatus(200);
});

module.exports = router;
