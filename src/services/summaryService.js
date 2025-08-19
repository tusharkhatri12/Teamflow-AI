const axios = require('axios');
require('dotenv').config();
const StandupMessage = require('../models/StandupMessage');

async function saveStandup(user, message, channel) {
  try {
    await StandupMessage.create({ user, message, channel, isSummary: false });
  } catch (e) {
    console.error('Failed saving standup message:', e.message);
  }
}

async function getStandupCount() {
  return StandupMessage.countDocuments({ isSummary: false });
}

async function resetStandups() {
  await StandupMessage.deleteMany({ isSummary: false });
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
  const recent = await StandupMessage.find({ isSummary: false }).sort({ createdAt: -1 }).limit(100);
  if (recent.length === 0) return '⚠️ No content to summarize';

  const formattedMessages = await Promise.all(
    recent.map(async s => {
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

    const content = response.data.choices[0].message.content;
    // Store the generated summary
    await StandupMessage.create({ user: 'StandupBot', message: content, isSummary: true });
    return content;
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
