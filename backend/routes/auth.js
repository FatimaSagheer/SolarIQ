const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');  // ✅ correct path
const UserSession = require('../models/userSession');  // ✅ correct path

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

    // ✅ Log register activity
    await ActivityLog.create({
      userId: user._id.toString(),
      userName: user.name,
      action: 'register',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success'
    });

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

    // ✅ user// ✅ Add debug log
console.log('User name:', user.name);
console.log('User id:', user._id);
    if (!user) {
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

    // ✅ wrong password — user exists so use user._id
    if (!isMatch) {
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

    // ✅ successful login
    await ActivityLog.create({
      userId: user._id.toString(),
      userName: user.name,
      action: 'login',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success'
    });

    // ✅ create session
    await UserSession.create({
      userId: user._id.toString(),
      userName: user.name,
      tokenPreview: token.substring(0, 20),
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
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