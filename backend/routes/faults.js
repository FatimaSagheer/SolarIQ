const express = require('express');
const router = express.Router();
const Fault = require('../models/Fault');

// GET all active faults
router.get('/', async (req, res) => {
  try {
    const faults = await Fault.find({ resolved: false })
      .populate('systemId', 'name city')
      .sort({ detectedAt: -1 });
    res.json(faults);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET faults for specific system
router.get('/system/:systemId', async (req, res) => {
  try {
    const faults = await Fault.find({ 
      systemId: req.params.systemId,
      resolved: false 
    }).sort({ detectedAt: -1 });
    res.json(faults);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH resolve a fault
router.patch('/:id/resolve', async (req, res) => {
  try {
    const fault = await Fault.findByIdAndUpdate(
      req.params.id,
      { resolved: true, resolvedAt: new Date() },
      { new: true }
    );
    res.json(fault);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;