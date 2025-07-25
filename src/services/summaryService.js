const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const standupsPath = path.join(__dirname, '../../data/standups.json');
let standups = [];

try {
  standups = JSON.parse(fs.readFileSync(standupsPath));
} catch (e) {
  standups = [];
}

function saveStandup(user, message) {
  standups.push({ user, message });
  fs.writeFileSync(standupsPath, JSON.stringify(standups, null, 2));
}

function getStandupCount() {
  return standups.length;
}

function resetStandups() {
  standups = [];
  fs.writeFileSync(standupsPath, JSON.stringify([], null, 2));
}

async function getUsername(userId) {
  if (!userId) return 'Unknown';
  try {
    const response = await axios.get(`https://slack.com/api/users.info?user=${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`
      }
    });

    return response.data.user?.real_name || userId;
  } catch (err) {
    console.error('❌ Failed to fetch username:', err.message);
    return userId;
  }
}

async function summarizeTextWithNames() {
  if (standups.length === 0) return '⚠️ No content to summarize';

  const formattedMessages = await Promise.all(
    standups.map(async s => {
      const name = await getUsername(s.user);
      return `${name}: ${s.message}`;
    })
  );

  const prompt = `Summarize the following standup conversation:\n\n${formattedMessages.join('\n')}`;

  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      messages: [
        { role: 'system', content: 'You are a helpful assistant that summarizes team updates clearly.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama3-70b-8192',
    }, {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (err) {
    console.error('❌ Failed to summarize:', err.message);
    return '❌ Error generating summary.';
  }
}

module.exports = {
  saveStandup,
  summarizeText: summarizeTextWithNames,  // ✅ Important
  resetStandups,
  getStandupCount
};
