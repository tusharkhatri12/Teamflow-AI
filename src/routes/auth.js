const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { nanoid } = require('nanoid');
const User = require('../models/User');
const Organization = require('../models/Organizations');
const { sendPasswordResetOTP, sendEmailVerificationOTP } = require('../services/emailService');
const axios = require('axios');

const router = express.Router();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Simple test signup route
router.post('/signup-test', (req, res) => {
  console.log('Test signup endpoint hit');
  console.log('Request body:', req.body);
  res.json({ message: 'Test signup successful', data: req.body });
});

// Signup with email verification
router.post('/signup', async (req, res) => {
  try {
    console.log('Signup endpoint hit');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    
    const { name, email, password, role, organizationName, joinCode } = req.body;
    
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword, role });

    // Generate email verification OTP
    const emailVerificationOtp = generateOTP();
    user.emailVerificationOtp = emailVerificationOtp;
    user.emailVerificationOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // If user is admin, create organization
    if (role === 'admin' && organizationName) {
      const generatedJoinCode = nanoid(6).toUpperCase();
      const org = new Organization({
        name: organizationName,
        joinCode: generatedJoinCode,
        admin: user._id,
        members: [user._id]
      });
      await org.save();
      user.organization = org._id;
      console.log('Organization created with join code:', generatedJoinCode);
    }
    // If user is employee, join organization
    else if (role === 'employee' && joinCode) {
      const org = await Organization.findOne({ joinCode: joinCode.toUpperCase() });
      if (!org) {
        return res.status(400).json({ message: 'Invalid join code' });
      }
      user.organization = org._id;
      org.members.push(user._id);
      await org.save();
      console.log('User joined organization:', org.name);
    }

    await user.save();
    console.log('User created:', user);

    // Send email verification OTP
    const emailSent = await sendEmailVerificationOTP(email, emailVerificationOtp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.json({ 
      message: 'User created successfully. Please check your email for verification OTP.',
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        organization: user.organization 
      } 
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify email OTP
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (user.emailVerificationOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.emailVerificationOtpExpiry) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    user.isEmailVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationOtpExpiry = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ 
      message: 'Email verified successfully',
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        organization: user.organization 
      } 
    });
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend email verification OTP
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    const emailVerificationOtp = generateOTP();
    user.emailVerificationOtp = emailVerificationOtp;
    user.emailVerificationOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    const emailSent = await sendEmailVerificationOTP(email, emailVerificationOtp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.json({ message: 'Verification OTP sent successfully' });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot password - send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Generate password reset OTP
    const resetOtp = generateOTP();
    user.resetPasswordOtp = resetOtp;
    user.resetPasswordOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send password reset OTP email
    const emailSent = await sendPasswordResetOTP(email, resetOtp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send password reset email' });
    }

    res.json({ message: 'Password reset OTP sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.resetPasswordOtpExpiry) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).populate('organization');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.password) return res.status(400).json({ message: 'Use Google login' });
    
    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(400).json({ 
        message: 'Please verify your email first. Check your inbox for verification OTP.',
        needsVerification: true 
      });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        organization: user.organization 
      } 
    });
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

// =====================
// Slack OAuth (User Connect)
// =====================

// Step 1: Redirect to Slack OAuth
router.get('/slack', async (req, res) => {
  try {
    const clientId = process.env.SLACK_CLIENT_ID;
    const redirectUri = process.env.SLACK_REDIRECT_URI; // e.g., https://your-api.onrender.com/auth/slack/callback
    if (!clientId || !redirectUri) {
      return res.status(500).send('Slack OAuth is not configured');
    }

    // Identify current app user via JWT (Authorization header) or token query
    let token = req.headers.authorization?.split(' ')[1] || req.query.token;
    if (!token) {
      return res.status(401).send('Missing user token');
    }

    // Read scopes from env; only include user_scope if explicitly defined
    const appScopes = (process.env.SLACK_OAUTH_SCOPES || 'channels:read,groups:read,channels:join,chat:write').trim();
    const userScopes = (process.env.SLACK_USER_SCOPES || '').trim();

    const params = new URLSearchParams({
      client_id: clientId,
      scope: appScopes,
      redirect_uri: redirectUri,
      state: token
    });
    if (userScopes.length > 0) {
      params.append('user_scope', userScopes);
    }

    // Use global Slack OAuth v2 endpoint (not workspace URL)
    const url = `https://slack.com/oauth/v2/authorize?${params.toString()}`;
    return res.redirect(url);
  } catch (e) {
    console.error('Slack auth start error:', e);
    return res.status(500).send('Slack auth error');
  }
});

// Step 2: Handle Slack OAuth callback
router.get('/slack/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const redirectUri = process.env.SLACK_REDIRECT_URI;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (!code || !state) {
      return res.redirect(`${frontendUrl}/?slack=error&reason=missing_params`);
    }

    // Validate and decode our own JWT from state to find user
    let decoded;
    try {
      decoded = jwt.verify(state, process.env.JWT_SECRET);
    } catch (e) {
      return res.redirect(`${frontendUrl}/?slack=error&reason=invalid_state`);
    }

    // Exchange code for access tokens
    const tokenResp = await axios.post('https://slack.com/api/oauth.v2.access', new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

    if (!tokenResp.data.ok) {
      console.error('Slack token exchange failed:', tokenResp.data);
      return res.redirect(`${frontendUrl}/?slack=error&reason=exchange_failed`);
    }

    const authedUserId = tokenResp.data.authed_user?.id; // Slack user id
    // const botToken = tokenResp.data.access_token; // App-level token if needed

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.redirect(`${frontendUrl}/?slack=error&reason=user_not_found`);
    }

    user.slackUserId = authedUserId || user.slackUserId;
    user.slackConnected = Boolean(authedUserId);
    await user.save();

    return res.redirect(`${frontendUrl}/?slack=connected`);
  } catch (e) {
    console.error('Slack callback error:', e);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/?slack=error`);
  }
});


// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('organization');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        organization: user.organization 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 