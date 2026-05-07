const express = require('express');
const router = express.Router();
const Reading = require('../models/Reading');

// GET readings for a system
router.get('/:systemId', async (req, res) => {
  try {
    const readings = await Reading.find({ systemId: req.params.systemId })
      .sort({ timestamp: -1 })
      .limit(48); // last 24 hours
    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET last 48 readings for ALL systems combined
router.get('/chart/combined', async (req, res) => {
  try {
    const readings = await Reading.find()
      .sort({ timestamp: 1 })
      .limit(2400); // 50 systems × 48 readings
    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET latest reading for all systems
router.get('/latest/all', async (req, res) => {
  try {
    const latest = await Reading.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$systemId', latest: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$latest' } }
    ]);
    res.json(latest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;