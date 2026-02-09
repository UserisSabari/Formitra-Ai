const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
