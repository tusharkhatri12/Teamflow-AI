const express = require('express');
const router = express.Router();
const axios = require('axios');
const { saveStandup, summarizeText } = require('../services/summaryService');

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

router.post('/', async (req, res) => {
  const { type, challenge, event } = req.body;

  // Slack verification
  if (type === 'url_verification') {
    return res.status(200).json({ challenge });
  }

  // Only handle message events (not bot messages or edits)
  if (type === 'event_callback' && event.type === 'message' && !event.subtype) {
    const user = event.user;
    const text = event.text;
    const channel = event.channel;

    console.log(`📥 Message from ${user}: ${text}`);

    if (text.toLowerCase().includes('/summarize')) {
      console.log('📄 Summarize command triggered');
      try {
        const summary = await summarizeText();

        await axios.post(
          'https://slack.com/api/chat.postMessage',
          {
            channel: channel,
            text: `:memo: *Conversation Summary:*\n${summary}`,
          },
          {
            headers: {
              Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('✅ Posted summary to Slack');
      } catch (err) {
        console.error('❌ Failed to summarize:', err.message);
      }
    } else {
      // Save normal messages for standup
      try {
        saveStandup(user, text);
      } catch (err) {
        console.error('❌ Failed to save message:', err.message);
      }
    }
  }

  return res.sendStatus(200);
});

module.exports = router;
