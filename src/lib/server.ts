const express = require('express');
const authRoutes = require('./authRoutes');
const albumRoutes = require('./albumRoutes');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 4000;

const UPLOADS_BASE_PATH = process.env.UPLOADS_BASE_PATH || 'uploads';

app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.resolve(UPLOADS_BASE_PATH)));

app.use('/api/auth', authRoutes);
app.use('/api/albums', albumRoutes);

app.get('/api/auth/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Auth server is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}/api/auth`);
  console.log(`Uploads served from /uploads (base path: ${UPLOADS_BASE_PATH})`);
}); 