const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const uploadRoutes = require('./routes/upload');

// Allow only the configured frontend origin in production.
// For local dev, this defaults to http://localhost:5173.
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: false,
}));
app.use(express.json());
app.use('/api', uploadRoutes);

app.get('/api/services', (req, res) => {
  res.json([
    { id: 'passport', name: 'Passport Renewal', icon: 'Passport' },
    { id: 'income', name: 'Income Certificate', icon: 'FileText' },
    { id: 'birth', name: 'Birth Certificate', icon: 'Baby' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
