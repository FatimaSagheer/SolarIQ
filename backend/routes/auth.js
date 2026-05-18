const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');
const UserSession = require('../models/userSession')

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // ✅ Log failed login attempt
      await ActivityLog.create({
        userId: 'unknown',
        userName: 'unknown',
        action: 'login',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'failed'
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // ✅ Log failed login
      await ActivityLog.create({
        userId: user._id.toString(),
        userName: user.name,
        action: 'login',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'failed'
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    // ✅ Log successful login
    await ActivityLog.create({
      userId: user._id.toString(),
      userName: user.name,
      action: 'login',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success'
    });

    // ✅ Create session record
    await UserSession.create({
      userId: user._id.toString(),
      userName: user.name,
      tokenPreview: token.substring(0, 20),
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get current user
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;