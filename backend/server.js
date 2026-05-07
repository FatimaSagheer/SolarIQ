const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

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

app.use('/api/systems', require('./routes/systems'));
app.use('/api/readings', require('./routes/readings'));
app.use('/api/faults', require('./routes/faults'));

// Start server AFTER DB connects
const start = async () => {
  await connectDB();
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
};

start();
