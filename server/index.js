const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const uploadRoutes = require('./routes/upload');

// --- Middleware ---
app.use(helmet()); // Secure HTTP headers
app.use(morgan('dev')); // Professional request logging
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: false,
}));
app.use(express.json());

// --- Routes ---
app.use('/api', uploadRoutes);

app.get('/api/services', (req, res) => {
  res.json([
    { id: 'passport', name: 'Passport Renewal', icon: 'Passport' },
    { id: 'income', name: 'Income Certificate', icon: 'FileText' },
    { id: 'birth', name: 'Birth Certificate', icon: 'Baby' }
  ]);
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error('[Error:', err.message || err, ']');
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// --- Server Startup & Graceful Shutdown ---
const server = app.listen(PORT, () => {
  console.log(`Server securely running on port ${PORT}`);
});

const shutdown = () => {
  console.log('SIGTERM/SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
