const fs = require('fs');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const DATA_PATH = path.join(__dirname, '../../data/standups.json');

// 🧠 Load saved messages
function readMessages() {
  if (!fs.existsSync(DATA_PATH)) return [];
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
}

// 🧼 Clear messages after summary
function clearMessages() {
  fs.writeFileSync(DATA_PATH, '[]');
}

// 📝 Save message
function storeMessage(message) {
  const all = readMessages();
  all.push(message);
  fs.writeFileSync(DATA_PATH, JSON.stringify(all, null, 2));
}

// 🔍 Get Slack user display name
async function getUserName(userId) {
  try {
    const response = await axios.get('https://slack.com/api/users.info', {
      params: { user: userId },
      headers: {
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`
      }
    });

    if (response.data.ok && response.data.user) {
      return response.data.user.real_name || response.data.user.name || userId;
    }

    return userId;
  } catch (err) {
    console.error('⚠️ Failed to get Slack username:', err.message);
    return userId;
  }
}

// 🤖 Generate & post daily summary
async function generateDailySummary() {
  const allStandups = readMessages();
  if (allStandups.length === 0) {
    console.log('ℹ️ No standups to summarize today.');
    return;
  }

  const lines = [];

  for (const item of allStandups) {
    const name = await getUserName(item.user);
    lines.push(`${name}: ${item.text}`);
  }

  const formatted = lines.join('\n');

  const prompt = `Summarize today's standups clearly:\n${formatted}`;

  const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model: 'llama3-70b-8192',
    messages: [
      { role: 'system', content: 'You are a helpful assistant who summarizes team standups.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7
  }, {
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  const summary = response.data.choices[0].message.content;

  // 📨 Post to Slack
  await axios.post('https://slack.com/api/chat.postMessage', {
    channel: process.env.SLACK_CHANNEL_ID,
    text: `📅 *Daily Standup Summary:*\n${summary}`
  }, {
    headers: {
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  console.log('✅ Daily summary posted to Slack!');
  clearMessages();
}

module.exports = {
  storeMessage,
  generateDailySummary
};
