const express = require('express');
const router = express.Router();
const System = require('../models/System');
const Reading = require('../models/Reading');
const Fault = require('../models/Fault');

// GET all systems
router.get('/', async (req, res) => {
  try {
    const systems = await System.find();
    res.json(systems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single system
router.get('/:id', async (req, res) => {
  try {
    const system = await System.findById(req.params.id);
    if (!system) return res.status(404).json({ error: 'System not found' });
    res.json(system);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET system stats summary
router.get('/stats/summary', async (req, res) => {
  try {

// countDocuments() → count how many documents exist
// countDocuments({ status: 'active' }) → count only where status equals active
// This is like SQL: SELECT COUNT(*) WHERE status = 'active'

    const total = await System.countDocuments();
    const active = await System.countDocuments({ status: 'active' });
    const fault = await System.countDocuments({ status: 'fault' });
    const offline = await System.countDocuments({ status: 'offline' });


// Step 1: $sort   → sort all readings newest first      ↓
// Step 2: $group  → for each system, keep only the LATEST reading          ↓
// Step 3: $group  → add up all power outputs into one total number

    // Total current power output
    const latestReadings = await Reading.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$systemId', powerOutput: { $first: '$powerOutput' } } },
      { $group: { _id: null, totalPower: { $sum: '$powerOutput' } } }
    ]);

    res.json({
      total,
      active,
      fault,
      offline,
      totalPower: latestReadings[0]?.totalPower?.toFixed(2) || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;