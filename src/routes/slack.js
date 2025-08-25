const express = require('express');
const router = express.Router();
const { summarizeText, saveStandup } = require('../services/summaryService');
const StandupMessage = require("../models/StandupMessage");

// Route to handle Slack's URL verification and incoming events
router.post('/', async (req, res) => {
  const { type, challenge, event } = req.body;

  // Handle Slack's URL verification
  if (type === 'url_verification') {
    return res.json({ challenge });
  }

  // Handle incoming events
  if (type === 'event_callback' && event) {
    console.log(`📨 Received Slack event: ${event.type}`);
    
    // Handle message events
    if (event.type === 'message' && event.text && !event.bot_id) {
      try {
        await saveStandup(event.user, event.text, event.channel);
        console.log(`✅ Message saved to database from user ${event.user}`);
      } catch (err) {
        console.error('❌ Error saving message:', err.message);
      }
    }
  }

  res.json({ ok: true });
});

// Route to handle incoming Slack messages and save them to database
router.post('/message', async (req, res) => {
  const { user, text, channel } = req.body;

  console.log(`📨 Received message from ${user} in ${channel}: ${text}`);

  try {
    // Save the message to the database
    await saveStandup(user, text, channel);
    
    res.json({ 
      success: true, 
      message: 'Message saved to database' 
    });
  } catch (err) {
    console.error('❌ Error saving message:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save message' 
    });
  }
});

// Route to handle the /summarize command (keeping existing functionality)
router.post('/summarize', async (req, res) => {
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

    // Format messages for summarization
    const formatted = standups
      .map(s => `${s.user}: ${s.message}`)
      .join('\n');

    // Generate summary with AI
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

// Route to get all messages from database
router.get('/messages', async (req, res) => {
  try {
    const messages = await StandupMessage.find({ isSummary: false })
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({ 
      success: true, 
      messages 
    });
  } catch (err) {
    console.error('❌ Error fetching messages:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch messages' 
    });
  }
});

module.exports = router;
