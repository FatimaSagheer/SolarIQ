const System = require('../models/System');
const Reading = require('../models/Reading');
const Fault = require('../models/Fault');
const { sendCriticalFaultEmail, sendSystemOfflineEmail } = require('../services/email');

// Realistic power simulation based on time of day
function simulatePower(capacity, hour) {
  const isDaylight = hour >= 6 && hour <= 19;
  if (!isDaylight) return 0;
  
  const solarFactor = Math.sin(((hour - 6) / 13) * Math.PI);
  const variance = 0.85 + Math.random() * 0.15; // 85-100% variance
  return parseFloat((capacity * solarFactor * variance).toFixed(2));
}

// Random fault generator (5% chance per update)
async function maybeGenerateFault(systems) {
  const shouldFault = Math.random() < 0.05;
  if (!shouldFault) return null;

  const faultTypes = [
    { type: 'inverter_failure',   severity: 'critical', message: 'Inverter not responding' },
    { type: 'low_output',         severity: 'low',      message: 'Output 20% below expected' },
    { type: 'overheating',        severity: 'high',     message: 'Temperature exceeds safe limit' },
    { type: 'communication_loss', severity: 'high',     message: 'Lost communication with system' },
  ];

  const randomSystem = systems[Math.floor(Math.random() * systems.length)];
  const randomFault  = faultTypes[Math.floor(Math.random() * faultTypes.length)];

  const fault = await Fault.create({
    systemId:   randomSystem._id,
    type:       randomFault.type,
    severity:   randomFault.severity,
    message:    randomFault.message,
    detectedAt: new Date()
  });

  await fault.populate('systemId', 'name city');

  // ✅ Send email for critical faults only
  if (randomFault.severity === 'critical') {
    await sendCriticalFaultEmail(fault, randomSystem);
  }

  return fault;
}

function initSocket(io) {
  io.on('connection', (socket) => {
    console.log('⚡ Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  // Push live updates every 30 seconds
  setInterval(async () => {
    try {
      const now = new Date();
      const hour = now.getHours();

      // Fetch all active systems
      const systems = await System.find({ status: 'active' });

      // Generate new reading for each system
      const readings = [];
      let totalPower = 0;

      for (const system of systems) {
        const powerOutput = simulatePower(system.capacity, hour);
        totalPower += powerOutput;

        const reading = await Reading.create({
          systemId:    system._id,
          timestamp:   now,
          powerOutput,
          energyToday: parseFloat((powerOutput * 0.5).toFixed(2)),
          irradiance:  parseFloat((powerOutput * 25).toFixed(2)),
          temperature: parseFloat((25 + Math.random() * 20).toFixed(1)),
          efficiency:  parseFloat((14 + Math.random() * 8).toFixed(1)),
          voltage:     parseFloat((380 + Math.random() * 40).toFixed(1)),
          current:     parseFloat((powerOutput / 0.4).toFixed(2)),
        });

        readings.push(reading);
      }

      // Push new reading to all clients
      io.emit('reading:new', {
        timestamp:  now,
        totalPower: parseFloat(totalPower.toFixed(2)),
        count:      readings.length
      });

      // Maybe push a new fault
      const fault = await maybeGenerateFault(systems);
      if (fault) {
        io.emit('fault:new', fault);
        console.log('⚠️  New fault pushed:', fault.type);
      }

      // Push updated stats
      const total   = await System.countDocuments();
      const active  = await System.countDocuments({ status: 'active' });
      const faultCount = await System.countDocuments({ status: 'fault' });
      const offline = await System.countDocuments({ status: 'offline' });

      io.emit('stats:update', {
        total,
        active,
        fault: faultCount,
        offline,
        totalPower: parseFloat(totalPower.toFixed(2))
      });

      console.log(`📊 Live update pushed — total power: ${totalPower.toFixed(2)} kW`);

    } catch (err) {
      console.error('Socket update error:', err);
    }
  }, 30000); // every 30 seconds
}

module.exports = { initSocket };