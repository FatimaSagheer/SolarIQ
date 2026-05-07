const mongoose = require('mongoose');

const systemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  capacity: { type: Number, required: true }, // kW
  status: { 
    type: String, 
    enum: ['active', 'fault', 'offline'], 
    default: 'active' 
  },
  installDate: { type: Date, default: Date.now },
  panelCount: { type: Number, required: true },
  inverterModel: { type: String },
  performanceRatio: { type: Number, default: 0.75 }, // 75% typical
}, { timestamps: true });

module.exports = mongoose.model('System', systemSchema);