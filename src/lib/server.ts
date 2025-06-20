import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './authRoutes.js';
import albumRoutes from './albumRoutes.js';
import playlistRoutes from './playlistRoutes.js';
import songRoutes from './songRoutes.js';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

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

app.use('/api/auth', authRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/songs', songRoutes);

app.get('/api/auth/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Auth server is running' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}/api/auth`);
  console.log(`Uploads served from /uploads (base path: ${UPLOADS_BASE_PATH_SERVER})`);
}); 