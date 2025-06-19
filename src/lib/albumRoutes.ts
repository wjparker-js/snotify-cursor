import express from 'express';
import type { Request, Response } from 'express';
import { getAlbums } from './albumApi.js';
import fs from 'fs';
import path from 'path';
import prisma from '../integrations/mysql.js';
import multer from 'multer';
import * as mm from 'music-metadata';
import dotenv from 'dotenv';

dotenv.config();

const UPLOADS_BASE_PATH = process.env.UPLOADS_BASE_PATH || 'uploads';

const router = express.Router();

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Multer storage config for album images
const storage = multer.diskStorage({
  destination: (req: MulterRequest, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const albumId = req.params.id || 'temp';
    const albumDir = path.join(UPLOADS_BASE_PATH, 'albums', albumId.toString());
    fs.mkdirSync(albumDir, { recursive: true });
    cb(null, albumDir);
  },
  filename: (req: MulterRequest, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const ext = path.extname(file.originalname);
    cb(null, 'cover' + ext);
  },
});
const upload = multer({ storage });

// Multer storage config for track audio files
const trackStorage = multer.diskStorage({
  destination: (req: MulterRequest, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const albumId = req.params.albumId;
    const albumDir = path.join(UPLOADS_BASE_PATH, 'albums', albumId.toString());
    fs.mkdirSync(albumDir, { recursive: true });
    cb(null, albumDir);
  },
  filename: (req: MulterRequest, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, file.originalname);
  },
});
const trackUpload = multer({ storage: trackStorage });

// Add endpoints for album cover blob upload and serving
const upload2 = multer(); // memory storage for blob

// GET /api/albums - fetch all albums
router.get('/', async (req: Request, res: Response) => {
  try {
    const albums = await getAlbums();
    res.status(200).json(albums);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// POST /api/albums - create album with optional image upload
router.post('/', upload.single('image'), async (req: MulterRequest, res: Response) => {
  try {
    const { title, artist, year, track_count, duration, description, genre } = req.body;
    if (!title || !artist) {
      return res.status(400).json({ error: 'Title and artist are required' });
    }
    let image_url = null;
    const album = await prisma.album.create({
      data: {
        title,
        artist,
        image_url: image_url, // may be null for now
        year,
        track_count,
        duration: duration || '',
        description: description || '',
        genre: genre || '',
      },
    });
    
    // Update image_url with proper path structure after getting album ID
    if (req.file) {
      image_url = `albums/${album.id}/${req.file.filename}`;
      await prisma.album.update({ 
        where: { id: album.id }, 
        data: { image_url: image_url } 
      });
      album.image_url = image_url;
    } else {
      const placeholderUrl = `https://placehold.co/300x300.png?text=Album+${album.id}`;
      await prisma.album.update({ where: { id: album.id }, data: { image_url: placeholderUrl } });
      album.image_url = placeholderUrl;
    }
    res.status(201).json(album);
  } catch (error) {
    console.error('Album creation error:', error);
    console.error('Request body:', req.body);
    console.error('Request file:', req.file);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message || 'Unknown error' });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// GET /:id - fetch a single album by id
router.get('/:id', async (req, res) => {
  try {
    const albumId = parseInt(req.params.id, 10);
    if (isNaN(albumId)) {
      return res.status(400).json({ error: 'Invalid album id' });
    }
    let album = await prisma.album.findUnique({ where: { id: albumId } });
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }
    // If no image_url, set placeholder
    if (!album.image_url) {
      album.image_url = `https://placehold.co/300x300.png?text=Album+${album.id}`;
    }
    res.status(200).json(album);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /:albumId/tracks - upload a track for an album
router.post('/:albumId/tracks', trackUpload.single('audio'), async (req, res) => {
  console.log('Received POST /api/albums/:albumId/tracks', req.params, req.body, req.file);
  try {
    const albumId = parseInt(req.params.albumId, 10);
    if (!req.file || isNaN(albumId)) {
      return res.status(400).json({ error: 'Audio file and albumId are required' });
    }
    // Fetch album to get the title
    const album = await prisma.album.findUnique({ where: { id: albumId } });
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }
    const albumTitle = album.title || 'untitled_album';
    // Use the title from the form, not the filename
    const title = req.body.title || req.file.originalname.replace(/\.[^/.]+$/, "");
    const artist = req.body.artist || 'Unknown Artist';
    const genre = req.body.genre || 'Rock';
    // Store the relative path as albums/<albumId>/<filename>
    const audioPath = `albums/${albumId}/${req.file.originalname}`;
    // Derive duration from audio file
    let duration = '0:00';
    try {
      const metadata = await mm.parseFile(req.file.path);
      if (metadata.format.duration) {
        const totalSeconds = Math.round(metadata.format.duration);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    } catch (err) {
      console.warn('Could not parse audio duration:', err);
    }
    const song = await prisma.song.create({
      data: {
        title,
        artist,
        url: audioPath,
        albumId: albumId,
        duration,
        genre,
        updatedAt: new Date(),
      },
    });
    res.status(201).json(song);
  } catch (error) {
    console.error('Track upload error:', error, error?.stack);
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
});

// GET /:albumId/tracks - fetch all tracks for an album
router.get('/:albumId/tracks', async (req, res) => {
  try {
    const albumId = parseInt(req.params.albumId, 10);
    if (isNaN(albumId)) {
      return res.status(400).json({ error: 'Invalid albumId' });
    }
    const tracks = await prisma.song.findMany({ where: { albumId } });
    if (!tracks || tracks.length === 0) {
      return res.status(404).json({ error: 'No tracks found for this album' });
    }
    res.status(200).json(tracks);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
});

// POST /api/albums/:id/cover - upload and store album cover as blob
router.post('/:id/cover', upload2.single('cover'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const albumId = parseInt(req.params.id, 10);
    if (isNaN(albumId)) return res.status(400).json({ error: 'Invalid album id' });
    const album = await prisma.album.update({
      where: { id: albumId },
      data: { cover_blob: req.file.buffer },
    });
    res.json({ success: true, album });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to upload cover' });
  }
});

// GET /api/albums/:id/cover - serve the album cover image blob
router.get('/:id/cover', async (req, res) => {
  try {
    const albumId = parseInt(req.params.id, 10);
    if (isNaN(albumId)) return res.status(400).send('Invalid album id');
    const album = await prisma.album.findUnique({ where: { id: albumId } });
    if (!album || !album.cover_blob) return res.status(404).send('No cover image');
    res.set('Content-Type', 'image/jpeg');
    res.send(Buffer.from(album.cover_blob));
  } catch (error) {
    res.status(500).send('Failed to fetch cover image');
  }
});

export default router; 