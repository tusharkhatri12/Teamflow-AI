const express = require('express');
const router = express.Router();
const axios = require('axios');
const {summarizeText } = require('../services/summaryService');
const StandupMessage = require('../models/StandupMessage') ;

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;


router.post('/', async (req, res) => {
  const { user_name, channel_id, text } = req.body;

  console.log(`🚀 Slash command /summarize triggered by ${user_name}`);

  try {
    // Fetch all messages from MongoDB (you can filter by channel_id if needed)
    const standups = await StandupMessage.find().lean();

    if (!standups.length) {
      return res.json({
        response_type: 'ephemeral',
        text: '⚠️ No messages found to summarize.'
      });
    }

    // Format messages for summarization
    const formatted = standups
      .map(s => `${s.user}: ${s.message}`)
      .join('\n');

    // Generate AI summary
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
