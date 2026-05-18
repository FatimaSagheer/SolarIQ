const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { protect, adminOnly } = require('../middleware/auth');
const { Op } = require('sequelize');

// ✅ STATS must come BEFORE /:userId
// Otherwise Express thinks 'stats' is a userId!
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    // Count ALL records with action = login
    const totalLogins = await ActivityLog.count({
      where: { action: 'login' }
    });

    const totalFaultsResolved = await ActivityLog.count({
      where: { action: 'resolve_fault' }
    });

    const failedLogins = await ActivityLog.count({
      where: { 
        action: 'login', 
        status: 'failed' 
      }
    });

    const recentLogins = await ActivityLog.count({
      where: {
        action: 'login',
        createdAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    console.log('Stats:', { totalLogins, totalFaultsResolved, failedLogins, recentLogins });
    
    res.json({ totalLogins, totalFaultsResolved, failedLogins, recentLogins });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET all logs — also before /:userId
router.get('/', protect, async (req, res) => {
  try {
    const logs = await ActivityLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ /:userId comes LAST
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const logs = await ActivityLog.findAll({
      where: { userId: req.params.userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;