const express = require('express');
const cors = require('cors');
// const authRoutes = require('./authRoutes');
const albumRoutes = require('./albumRoutes');
const playlistRoutes = require('./playlistRoutes');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const UPLOADS_BASE_PATH_SERVER = process.env.UPLOADS_BASE_PATH || 'uploads';

const app = express();
const PORT = 4000;

// Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.resolve(UPLOADS_BASE_PATH_SERVER)));

// app.use('/api/auth', authRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/playlists', playlistRoutes);

app.get('/api/auth/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Auth server is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}/api/auth`);
  console.log(`Uploads served from /uploads (base path: ${UPLOADS_BASE_PATH_SERVER})`);
}); 