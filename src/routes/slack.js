const express = require('express');
const router = express.Router();
const { summarizeText, saveStandup } = require('../services/summaryService');
const StandupMessage = require("../models/StandupMessage");

// Route to handle Slack's URL verification and incoming events
router.post('/', async (req, res) => {
  const { type, challenge, event } = req.body || {};

  // Handle Slack's URL verification
  if (type === 'url_verification' && challenge) {
    return res.json({ challenge });
  }

  // Immediately acknowledge to avoid retries
  res.json({ ok: true });

  // Handle incoming events asynchronously
  try {
    if (type === 'event_callback' && event) {
      console.log(`📨 Slack event: ${event.type}${event.subtype ? ` (${event.subtype})` : ''}`);

      // app_mention → treat like a message from user with mention text
      if (event.type === 'app_mention') {
        const user = event.user;
        const channel = event.channel;
        const text = (event.text || '').trim();
        if (user && text) {
          await saveStandup(user, text, channel);
          console.log(`✅ Saved app_mention from ${user}`);
        }
        return;
      }

      if (event.type === 'message') {
        // Ignore bot messages
        if (event.bot_id) return;

        let user = event.user;
        let channel = event.channel;
        let text = event.text;

        // Handle edited or changed messages
        if (event.subtype === 'message_changed' && event.message) {
          user = event.message.user || user;
          text = event.message.text || text;
          channel = event.channel || channel;
        }

        // Handle thread messages and other variants
        if (!text && event.blocks && Array.isArray(event.blocks)) {
          // try to extract from rich text blocks
          try {
            const plain = event.blocks.map(b => (b.elements || []).map(e => (e.elements || []).map(el => el.text || '').join(' ')).join(' ')).join(' ').trim();
            if (plain) text = plain;
          } catch {}
        }

        if (user && text) {
          await saveStandup(user, text, channel);
          console.log(`✅ Saved message from ${user}`);
        }
      }
    }
  } catch (err) {
    console.error('❌ Slack event handling error:', err);
  }
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
  const { user_name } = req.body;

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
    const { channel, user } = req.query;

    const filter = { isSummary: false };
    if (channel) filter.channel = channel;
    if (user) filter.user = user;

    const messages = await StandupMessage.find(filter)
      .sort({ createdAt: -1 })
      .limit(1000);

    const [channels, users] = await Promise.all([
      StandupMessage.distinct('channel', { isSummary: false }),
      StandupMessage.distinct('user', { isSummary: false })
    ]);

    res.json({ 
      success: true, 
      messages,
      filters: {
        channels: channels.filter(Boolean),
        users: users.filter(Boolean)
      }
    });
  } catch (err) {
    console.error('❌ Error fetching messages:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch messages' 
    });
  }
});

// Route to get analytics data with user information
router.get('/analytics', async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    const now = new Date();
    let startDate;
    if (timeRange === 'week') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (timeRange === 'month') startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const messages = await StandupMessage.find({ isSummary: false, createdAt: { $gte: startDate } }).sort({ createdAt: 1 });

    const analytics = { totalMessages: messages.length, totalEmployees: new Set(messages.map(m => m.user).filter(u => u !== 'StandupBot')).size, timeData: [], employeeData: [], wordData: [] };

    if (timeRange === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now); date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = messages.filter(m => new Date(m.createdAt).toISOString().split('T')[0] === dateStr).length;
        analytics.timeData.push({ date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), messages: count });
      }
    } else {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now); date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = messages.filter(m => new Date(m.createdAt).toISOString().split('T')[0] === dateStr).length;
        analytics.timeData.push({ date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), messages: count });
      }
    }

    const employeeCounts = {};
    messages.forEach(message => { if (message.user && message.user !== 'StandupBot') employeeCounts[message.user] = (employeeCounts[message.user] || 0) + 1; });

    const employeeData = Object.entries(employeeCounts).map(([userId, count]) => ({ user: userId, count, userId })).sort((a,b)=>b.count-a.count).slice(0,10);
    analytics.employeeData = employeeData;

    const wordCounts = {};
    const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','is','are','was','were','be','been','have','has','had','do','does','did','will','would','could','should','may','might','can','this','that','these','those','i','you','he','she','it','we','they','me','him','her','us','them','my','your','his','her','its','our','their','mine','yours','his','hers','ours','theirs']);
    messages.forEach(message => {
      if (message.message && message.user !== 'StandupBot') {
        const words = message.message.toLowerCase().replace(/[^\w\s]/g,'').split(/\s+/).filter(w => w.length>2 && !stopWords.has(w));
        words.forEach(w => { wordCounts[w] = (wordCounts[w] || 0) + 1; });
      }
    });
    analytics.wordData = Object.entries(wordCounts).map(([word,count])=>({word,count})).sort((a,b)=>b.count-a.count).slice(0,20);

    res.json({ success: true, analytics });
  } catch (err) {
    console.error('❌ Error fetching analytics:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
