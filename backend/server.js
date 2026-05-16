const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { initSocket } = require('./socket/live');
const cron = require('node-cron');
const { sendWeeklyReportEmail } = require('./services/email');

dotenv.config();

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

app.use('/api/systems', require('./routes/systems'));
app.use('/api/readings', require('./routes/readings'));
app.use('/api/faults', require('./routes/faults'));

// Test email route — remove in production
app.get('/test-email', async (req, res) => {
  const { sendWeeklyReportEmail } = require('./services/email');
  await sendWeeklyReportEmail({
    total: 50, active: 39, fault: 9, offline: 2, totalPower: 253.33
  });
  res.json({ message: 'Test email sent! Check your inbox' });
});

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
  server.listen(3000, () => {
    console.log('Server running on port 3000');
  });
};

start();