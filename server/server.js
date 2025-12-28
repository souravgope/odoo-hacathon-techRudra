const express = require('express');
const cors = require('cors');
const { initializeDB } = require('./db');

// Prevent the server from crashing in dev when DB is temporarily unavailable
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/requests', require('./routes/requests'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'GearGuard API is running' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDB();
    app.listen(PORT, () => {
      console.log(`🚀 GearGuard server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

