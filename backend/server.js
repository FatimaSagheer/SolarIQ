const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { initSocket } = require('./socket/live');

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

const start = async () => {
  await connectDB();
  server.listen(3000, () => {
    console.log('Server running on port 3000');
  });
};

start();