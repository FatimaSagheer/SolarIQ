const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  systemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'System', 
    required: true 
  },
  timestamp: { type: Date, default: Date.now },
  powerOutput: { type: Number }, // kW current output
  energyToday: { type: Number }, // kWh today total
  irradiance: { type: Number },  // W/m² solar radiation
  temperature: { type: Number }, // celsius
  efficiency: { type: Number },  // percentage
  voltage: { type: Number },     // volts
  current: { type: Number },     // amps
}, { timestamps: true });

// Index for fast time-series queries
readingSchema.index({ systemId: 1, timestamp: -1 });

module.exports = mongoose.model('Reading', readingSchema);