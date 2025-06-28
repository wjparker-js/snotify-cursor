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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_BASE_PATH_SERVER = process.env.UPLOADS_BASE_PATH || 'uploads';

const app = express();
const PORT = 4000;

// Enable CORS for frontend - allow localhost and any ngrok domain
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (common with ngrok and proxied requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Allow localhost
    if (origin.includes('localhost:3000')) {
      return callback(null, true);
    }
    
    // Allow any ngrok domain
    if (origin.includes('.ngrok-free.app') || origin.includes('.ngrok.io')) {
      return callback(null, true);
    }
    
    // For development, be more permissive with ngrok-like patterns
    if (origin.match(/https?:\/\/[\w-]+\.ngrok/)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning', 'X-Requested-With'],
  credentials: true
}));

// Add ngrok warning skip middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

app.use(express.json());

// Serve static files from the uploads directory with caching
app.use('/uploads', express.static(path.resolve(UPLOADS_BASE_PATH_SERVER), {
  maxAge: '1y', // Cache for 1 year
  etag: true,
  lastModified: true,
  setHeaders: (res, path, stat) => {
    // Set cache control headers for different file types
    if (path.match(/\.(jpg|jpeg|png|gif|webp|ico)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (path.match(/\.(mp3|wav|flac|m4a|ogg)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

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