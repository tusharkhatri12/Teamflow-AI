const express = require('express');
const router = express.Router();
const {summarizeText} = require('../services/summaryService');
const fs = require('fs');
const path = require('path');

const standupsPath = path.join(__dirname, '../../data/standups.json');

router.post('/', async (req, res) => {
  const { user_name, channel_id, text } = req.body;

  console.log(`🚀 Slash command /summarize triggered by ${user_name}`);

  // Load messages from JSON
  let standups = [];
  try {
    const data = fs.readFileSync(standupsPath, 'utf8');
    standups = JSON.parse(data);
  } catch (err) {
    console.error('❌ Error reading standups.json:', err.message);
  }

  if (!standups.length) {
    return res.json({
      response_type: 'ephemeral',
      text: '⚠️ No messages found to summarize.'
    });
  }

  const formatted = standups.map(s => `${s.user}: ${s.message}`).join('\n');

  try {
    const summary = await summarizeText(formatted);

    return res.json({
      response_type: 'in_channel',
      text: `📝 *Conversation Summary:*\n${summary}`
    });
  } catch (err) {
    console.error('❌ Summary failed:', err.message);
    return res.json({
      response_type: 'ephemeral',
      text: '⚠️ Failed to generate summary. Please try again.'
    });
  }
});

module.exports = router;
