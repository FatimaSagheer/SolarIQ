const express = require('express');
const router = express.Router();
const ActivityLog = require('../../models/ActivityLog');
const { protect, adminOnly } = require('../../middleware/auth');
const { Op } = require('sequelize');

// GET all activity logs (admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const logs = await ActivityLog.findAll({
      order: [['createdAt', 'DESC']], // newest first
      limit: 100
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET activity logs for specific user
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

// GET activity stats summary
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalLogins = await ActivityLog.count({
      where: { action: 'login' }
    });

    const totalFaultsResolved = await ActivityLog.count({
      where: { action: 'resolve_fault' }
    });

    const failedLogins = await ActivityLog.count({
      where: { action: 'login', status: 'failed' }
    });

    // Logins in last 7 days
    const recentLogins = await ActivityLog.count({
      where: {
        action: 'login',
        createdAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    res.json({
      totalLogins,
      totalFaultsResolved,
      failedLogins,
      recentLogins
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;