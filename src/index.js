require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const apiRoutes = require('./routes/api');
const slackRoutes = require('./routes/slack');
const slashRouter = require('./routes/slash');
const authRoutes = require('./routes/auth');
const orgRoutes = require('./routes/org');
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
  origin: ['https://teamflow-ai-zeta.vercel.app', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport.initialize());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Routes
app.use('/api', apiRoutes);
app.use('/slash', slashRouter);
app.use('/slack/events', slackRoutes);
app.use('/auth', authRoutes);
app.use('/org', orgRoutes);
app.use('/api/organizations', orgRoutes);

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

// Error handling middleware for body parsing and other errors
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }
  
  if (err.code === 'STREAM_NOT_READABLE') {
    return res.status(400).json({ message: 'Request body parsing error' });
  }
  
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Slack bot running locally on port ${PORT}`);
});
