const mongoose = require('mongoose');

const faultSchema = new mongoose.Schema({
  systemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'System', 
    required: true 
  },
  type: { 
    type: String, 
    enum: [
      'inverter_failure',
      'panel_degradation', 
      'communication_loss',
      'overheating',
      'low_output',
      'grid_fault'
    ],
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    required: true 
  },
  message: { type: String, required: true },
  resolved: { type: Boolean, default: false },
  resolvedAt: { type: Date },
  detectedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Index for fast fault queries
faultSchema.index({ systemId: 1, resolved: 1 });
faultSchema.index({ detectedAt: -1 });

module.exports = mongoose.model('Fault', faultSchema);