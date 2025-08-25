const express = require('express');
const router = express.Router();
const { summarizeText } = require('../services/summaryService');
const StandupMessage = require('../models/StandupMessage');

router.post('/', async (req, res) => {
  const { user_name, channel_id, text } = req.body;

  console.log(`🚀 Slash command /summarize triggered by ${user_name}`);

  try {
    // ✅ Fetch all standups from MongoDB (you can filter by channel_id if needed)
    const standups = await StandupMessage.find({ isSummary: false }).sort({ createdAt: 1 });

    if (!standups.length) {
      return res.json({
        response_type: 'ephemeral',
        text: '⚠️ No messages found to summarize.'
      });
    }

    // Generate summary with AI using the database data
    const summary = await summarizeText();

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
