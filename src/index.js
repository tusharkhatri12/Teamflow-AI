require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const apiRoutes = require('./routes/api');
const bodyParser = require('body-parser');
const slackRoutes = require('./routes/slack');
const slashRouter = require('./routes/slash');
const authRoutes = require('./routes/auth');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

require('./config/passport'); // Passport config

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Enable CORS for frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());

// Routes
app.use('/api', apiRoutes);
app.use('/slash', slashRouter);
app.use('/slack/events', slackRoutes);
app.use('/auth', authRoutes);

// ✅ Correct path to /data/summaries.json
app.get('/summaries', (req, res) => {
  const summariesPath = path.resolve(__dirname, 'data', 'standups.json');

  fs.readFile(summariesPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading summaries.json:', err);
      return res.status(500).json({ error: 'Failed to read summaries file.' });
    }

    try {
      const summaries = JSON.parse(data);
      res.json(summaries);
    } catch (parseErr) {
      console.error('Error parsing summaries.json:', parseErr);
      res.status(500).json({ error: 'Invalid JSON in summaries file.' });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Slack bot running locally on port ${PORT}`);
});
