const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const Organization = require('../models/Organizations');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  console.log('Signup request:', req.body);
  try {
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword });
    await user.save();
    console.log('User created:', user);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.password) return res.status(400).json({ message: 'Use Google login' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/invite', async (req, res) => {
  const { orgId } = req.body;

  const joinCode = Math.random().toString(36).substr(2, 6).toUpperCase();
  const updated = await Organization.findByIdAndUpdate(orgId, { joinCode }, { new: true });

  res.json({ joinCode });
});


// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'],prompt: 'select_account' }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), (req, res) => {
  // Issue JWT and redirect to frontend with token
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  console.log('Redirecting to:', `${process.env.FRONTEND_URL}/login?token=${token}`);
  // You can redirect to your frontend and pass the token as a query param
  res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
});


module.exports = router; 