const express = require('express');
const bodyParser = require('body-parser');
const slackHandler = require('./routes/slack');
const cron = require('node-cron');
const { generateDailySummary } = require('./services/summaryService');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Slack Events
app.use('/slack/events', slackHandler);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Slack bot running on port ${PORT}`);
});

// Schedule 6 PM daily summary
cron.schedule('0 18 * * *', async () => {
  console.log('🕕 Running daily standup summary...');
  try {
    await generateDailySummary();
  } catch (err) {
    console.error('❌ Daily summary error:', err.message);
  }
});
generateDailySummary();
