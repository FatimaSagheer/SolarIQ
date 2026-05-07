const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { getSolarData, PAKISTAN_CITIES } = require('../services/pvgis');
const System = require('../models/System');
const Reading = require('../models/Reading');
const Fault = require('../models/Fault');

// dotenv.config({ path: '../.env' });
dotenv.config();

// 10 systems per city = 50 total
const SYSTEMS_PER_CITY = 10;

const INVERTER_MODELS = [
  'Huawei SUN2000-10KTL',
  'SMA Sunny Boy 10.0',
  'Fronius Primo 10.0',
  'ABB UNO-DM-10.0',
  'Sungrow SG10KTL'
];

const FAULT_TYPES = [
  { type: 'inverter_failure',    severity: 'critical', message: 'Inverter not responding'        },
  { type: 'panel_degradation',   severity: 'medium',   message: 'Panel output below threshold'   },
  { type: 'communication_loss',  severity: 'high',     message: 'Lost communication with system' },
  { type: 'overheating',         severity: 'high',     message: 'Temperature exceeds safe limit' },
  { type: 'low_output',          severity: 'low',      message: 'Output 20% below expected'      },
  { type: 'grid_fault',          severity: 'critical', message: 'Grid connection failure'         },
];

function randomBetween(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedSystems() {
  console.log('🌱 Seeding systems...');
  const systems = [];

  for (const city of PAKISTAN_CITIES) {
    console.log(`📡 Fetching PVGIS data for ${city.name}...`);
    
    // Get real solar data from PVGIS
    const solarData = await getSolarData(city.lat, city.lon, 10);
    console.log(`✅ ${city.name} avg daily output: ${solarData.avgDailyOutput} kWh`);

    for (let i = 1; i <= SYSTEMS_PER_CITY; i++) {
      const capacity = randomBetween(5, 50); // 5-50 kW systems
      const status = Math.random() < 0.1 ? 'fault' : 
                     Math.random() < 0.05 ? 'offline' : 'active';

      systems.push({
        name: `${city.name} Solar Plant ${i}`,
        city: city.name,
        lat: city.lat + randomBetween(-0.05, 0.05),
        lon: city.lon + randomBetween(-0.05, 0.05),
        capacity,
        status,
        panelCount: Math.round(capacity * 2.5),
        inverterModel: randomItem(INVERTER_MODELS),
        performanceRatio: randomBetween(0.70, 0.82),
        // Store real PVGIS data on system
        pvgisData: solarData
      });
    }
  }

  const inserted = await System.insertMany(systems);
  console.log(`✅ ${inserted.length} systems created`);
  return inserted;
}

async function seedReadings(systems) {
  console.log('📊 Seeding readings...');
  const readings = [];
  const now = new Date();

  for (const system of systems) {
    // Create 48 readings per system (last 24 hours, every 30 mins)
    for (let i = 47; i >= 0; i--) {
      const timestamp = new Date(now - i * 30 * 60 * 1000);
      const hour = timestamp.getHours();

      // Solar only generates during daylight (6am - 7pm)
      const isDaylight = hour >= 6 && hour <= 19;
      const solarFactor = isDaylight 
        ? Math.sin(((hour - 6) / 13) * Math.PI) 
        : 0;

      const powerOutput = system.status === 'offline' ? 0 :
        parseFloat((system.capacity * solarFactor * randomBetween(0.7, 0.95)).toFixed(2));

      readings.push({
        systemId: system._id,
        timestamp,
        powerOutput,
        energyToday: parseFloat((powerOutput * 0.5).toFixed(2)),
        irradiance: parseFloat((solarFactor * randomBetween(800, 1100)).toFixed(2)),
        temperature: parseFloat((randomBetween(25, 45)).toFixed(1)),
        efficiency: parseFloat((randomBetween(14, 22)).toFixed(1)),
        voltage: parseFloat((randomBetween(380, 420)).toFixed(1)),
        current: parseFloat((powerOutput / 0.4).toFixed(2)),
      });
    }
  }

  await Reading.insertMany(readings);
  console.log(`✅ ${readings.length} readings created`);
}

async function seedFaults(systems) {
  console.log('⚠️  Seeding faults...');
  const faults = [];

  for (const system of systems) {
    // 20% chance of having a fault
    if (Math.random() < 0.2) {
      const fault = randomItem(FAULT_TYPES);
      faults.push({
        systemId: system._id,
        type: fault.type,
        severity: fault.severity,
        message: fault.message,
        resolved: Math.random() < 0.5,
        detectedAt: new Date(Date.now() - randomBetween(0, 48) * 60 * 60 * 1000),
      });
    }
  }

  await Fault.insertMany(faults);
  console.log(`✅ ${faults.length} faults created`);
}

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await System.deleteMany({});
    await Reading.deleteMany({});
    await Fault.deleteMany({});

    // Seed in order
    const systems = await seedSystems();
    await seedReadings(systems);
    await seedFaults(systems);

    console.log('\n🎉 Seeding complete!');
    console.log(`   Systems  : 50`);
    console.log(`   Readings : ${50 * 48}`);
    console.log(`   Faults   : check above`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seed();