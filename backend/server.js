
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
// I fixed the issue by ensuring environment variables were loaded before 
// Sequelize initialization. Since Sequelize was being executed during 
// module import, dotenv needed to be configured at the entry point before 
// any database config file is imported.
const { sequelize } = require('./config/postgres');
require('./models/ActivityLog');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { connectPostgres } = require('./config/postgres');
const { initSocket } = require('./socket/live');
const cron = require('node-cron');
const { sendWeeklyReportEmail } = require('./services/email');




const app = express();
const server = http.createServer(app);

// ✅ create io and attach to server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ✅ init socket live updates
initSocket(io);

app.use(cors({
  origin: function(origin, callback) {
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log('HIT:', req.method, req.url);
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'Hello from SolarIQ 🚀' });
});
app.use('/api/auth', require('./routes/auth'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/systems', require('./routes/systems'));
app.use('/api/readings', require('./routes/readings'));
app.use('/api/faults', require('./routes/faults'));

// Test email route — remove in production
// app.get('/test-email', async (req, res) => {
//   const { sendWeeklyReportEmail } = require('./services/email');
//   await sendWeeklyReportEmail({
//     total: 50, active: 39, fault: 9, offline: 2, totalPower: 253.33
//   });
//   res.json({ message: 'Test email sent! Check your inbox' });
// });

// ⚠️ TEMPORARY — delete after use!
// app.get('/reset-db', async (req, res) => {
//   try {
//     await sequelize.query('DROP TABLE IF EXISTS "activity_logs" CASCADE');
//     await sequelize.query('DROP TABLE IF EXISTS "user_sessions" CASCADE');
//     await sequelize.query('DROP TYPE IF EXISTS "enum_activity_logs_action" CASCADE');
//     await sequelize.query('DROP TYPE IF EXISTS "enum_activity_logs_status" CASCADE');
//     await sequelize.sync({ force: true });
//     res.json({ message: '✅ Tables recreated!' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// Every Monday at 9am
cron.schedule('0 9 * * 1', async () => {
  console.log('📊 Sending weekly report...');
  
  const total   = await System.countDocuments();
  const active  = await System.countDocuments({ status: 'active' });
  const fault   = await System.countDocuments({ status: 'fault' });
  const offline = await System.countDocuments({ status: 'offline' });

  const latestReadings = await Reading.aggregate([
    { $sort: { timestamp: -1 } },
    { $group: { _id: '$systemId', powerOutput: { $first: '$powerOutput' } } },
    { $group: { _id: null, totalPower: { $sum: '$powerOutput' } } }
  ]);

  await sendWeeklyReportEmail({
    total,
    active,
    fault,
    offline,
    totalPower: latestReadings[0]?.totalPower?.toFixed(2) || 0
  });
});

const start = async () => {
  await connectDB();

  // PostgreSQL connect (authenticate only)
  await connectPostgres();

  // ✅ CREATE TABLES IF NOT EXIST (Sequelize magic)
// What sync() does?
// sequelize.sync()	      creates missing tables
// sync({ force: true })	deletes + recreates tables ❌ dangerous
// sync({ alter: true })	updates schema safely

  await sequelize.sync();

  console.log('✅ All PostgreSQL tables synced');

  server.listen(3000, () => {
    console.log('Server running on port 3000');
  });
};

start();