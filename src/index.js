require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const apiRoutes = require('./routes/api');
const slackRoutes = require('./routes/slack');
const slashRouter = require('./routes/slash');
const authRoutes = require('./routes/auth');
const orgRoutes = require('./routes/org');
const projectRoutes = require('./routes/projectRoutes');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// Safe visibility into env presence (no secrets printed)
console.log('Env check -> OPENAI_API_KEY set:', Boolean(process.env.OPENAI_API_KEY));
console.log('Env check -> GROQ_API_KEY set:', Boolean(process.env.GROQ_API_KEY));

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
app.use(express.json({ limit: '10mb', strict: false }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport.initialize());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Content-Type: ${req.headers['content-type']}`);
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

// Test database route
app.get('/test-db', async (req, res) => {
  try {
    const StandupMessage = require('./models/StandupMessage');
    const count = await StandupMessage.countDocuments();
    res.json({ 
      message: 'Database connection successful', 
      messageCount: count,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Database test failed:', err);
    res.status(500).json({ 
      message: 'Database connection failed', 
      error: err.message 
    });
  }
});

// Simple POST test route
app.post('/test-post', (req, res) => {
  console.log('Test POST hit');
  console.log('Body:', req.body);
  res.json({ message: 'POST test successful', body: req.body });
});

// Raw body test route
app.post('/test-raw', express.raw({ type: 'application/json' }), (req, res) => {
  console.log('Raw test POST hit');
  console.log('Raw body:', req.body);
  try {
    const parsed = JSON.parse(req.body);
    res.json({ message: 'Raw POST test successful', body: parsed });
  } catch (err) {
    res.status(400).json({ message: 'Invalid JSON in raw body' });
  }
});

// Routes
app.use('/api', apiRoutes);
app.use('/slash', slashRouter);
app.use('/slack', slackRoutes); // Slack events & helpers
app.use('/slack/events', slackRoutes); // Compatibility if Slack is pointed here
app.use('/org', orgRoutes);
app.use('/api/organizations', orgRoutes);
app.use('/api/projects', projectRoutes);
const meetingsRoutes = require('./routes/meetings');
app.use('/api/meetings', meetingsRoutes);

// Auth routes with specific middleware
app.use('/auth', express.json({ limit: '10mb' }), authRoutes);

// Summaries via MongoDB
const StandupMessage = require('./models/StandupMessage');
app.get('/summaries', async (req, res) => {
  try {
    const docs = await StandupMessage.find({ isSummary: true }).sort({ createdAt: -1 }).limit(200);
    res.json(docs);
  } catch (err) {
    console.error('Error fetching summaries:', err);
    res.status(500).json({ error: 'Failed to fetch summaries' });
  }
});

// Error handling middleware for body parsing and other errors
app.use((err, req, res, next) => {
  console.error('Error:', err);
  console.error('Error stack:', err.stack);
  
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }
  
  if (err.code === 'STREAM_NOT_READABLE' || err.message.includes('stream is not readable')) {
    console.error('Stream error detected');
    return res.status(400).json({ message: 'Request body parsing error - please check your request format' });
  }
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid request body format' });
  }
  
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Slack bot running locally on port ${PORT}`);
});
