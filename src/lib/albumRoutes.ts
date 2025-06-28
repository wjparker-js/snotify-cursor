import express from 'express';
import type { Request, Response } from 'express';
import { getAlbums, getAlbumById, createAlbum, updateAlbum, deleteAlbum } from './albumApi.js';
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

// Utility function to sanitize album title for folder name
function sanitizeFolderName(title: string): string {
  return title
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid folder characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .toLowerCase()
    .trim();
}

// Multer storage config for album covers
const storage = multer.diskStorage({
  destination: async (req: MulterRequest, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    try {
      const { title } = req.body;
      if (!title) {
        return cb(new Error('Album title is required for upload'), '');
      }
      
      const sanitizedTitle = sanitizeFolderName(title);
      const albumDir = path.join(UPLOADS_BASE_PATH, 'albums', sanitizedTitle);
      fs.mkdirSync(albumDir, { recursive: true });
      cb(null, albumDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req: MulterRequest, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const ext = path.extname(file.originalname);
    cb(null, 'cover' + ext);
  },
});
const upload = multer({ storage });

// Multer storage config for track audio files
const trackStorage = multer.diskStorage({
  destination: async (req: MulterRequest, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    try {
      const albumId = parseInt(req.params.albumId, 10);
      if (isNaN(albumId)) {
        return cb(new Error('Invalid album ID'), '');
      }
      
      // Fetch album to get the title
      const album = await prisma.album.findUnique({ where: { id: albumId } });
      if (!album) {
        return cb(new Error('Album not found'), '');
      }
      
      const sanitizedTitle = sanitizeFolderName(album.title);
      const albumDir = path.join(UPLOADS_BASE_PATH, 'albums', sanitizedTitle, 'tracks');
      fs.mkdirSync(albumDir, { recursive: true });
      cb(null, albumDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req: MulterRequest, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Use timestamp + random number to avoid filename conflicts
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000000);
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${random}${ext}`);
  },
});
const trackUpload = multer({ storage: trackStorage });



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
    
    // Create album first
    let album = await createAlbum({
      title,
      artist,
      year,
      track_count,
      duration: duration || '',
      description: description || '',
      genre: genre || '',
    });
    
    // Update image_url with proper path structure after getting album ID
    if (req.file) {
      const sanitizedTitle = sanitizeFolderName(title);
      const image_url = `albums/${sanitizedTitle}/${req.file.filename}`;
      album = await updateAlbum(album.id, { image_url });
    } else {
      const placeholderUrl = `https://placehold.co/300x300.png?text=Album+${album.id}`;
      album = await updateAlbum(album.id, { image_url: placeholderUrl });
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
    let album = await getAlbumById(albumId);
    // If no image_url, set placeholder
    if (!album.image_url) {
      album.image_url = `https://placehold.co/300x300.png?text=Album+${album.id}`;
    }
    res.status(200).json(album);
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// PUT /:id - update an album
router.put('/:id', async (req, res) => {
  try {
    const albumId = parseInt(req.params.id, 10);
    if (isNaN(albumId)) {
      return res.status(400).json({ error: 'Invalid album id' });
    }
    
    const { title, artist, year, track_count, duration, description, genre, image_url } = req.body;
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (artist !== undefined) updateData.artist = artist;
    if (year !== undefined) updateData.year = year;
    if (track_count !== undefined) updateData.track_count = track_count;
    if (duration !== undefined) updateData.duration = duration;
    if (description !== undefined) updateData.description = description;
    if (genre !== undefined) updateData.genre = genre;
    if (image_url !== undefined) updateData.image_url = image_url;
    
    const album = await updateAlbum(albumId, updateData);
    res.status(200).json(album);
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
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
    
    const sanitizedTitle = sanitizeFolderName(album.title);
    
    // Use the title from the form, not the filename
    const title = req.body.title || req.file.originalname.replace(/\.[^/.]+$/, "");
    const artist = req.body.artist || album.artist;
    const genre = req.body.genre || 'Rock';
    
    // Store the relative path as albums/<sanitized_title>/tracks/<filename>
    const audioPath = `albums/${sanitizedTitle}/tracks/${req.file.filename}`;
    
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

// Multer storage config specifically for cover updates
const coverUpdateStorage = multer.diskStorage({
  destination: async (req: MulterRequest, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    try {
      const albumId = parseInt(req.params.id, 10);
      if (isNaN(albumId)) {
        return cb(new Error('Invalid album ID'), '');
      }
      
      // Fetch album to get the title
      const album = await prisma.album.findUnique({ where: { id: albumId } });
      if (!album) {
        return cb(new Error('Album not found'), '');
      }
      
      const sanitizedTitle = sanitizeFolderName(album.title);
      const albumDir = path.join(UPLOADS_BASE_PATH, 'albums', sanitizedTitle);
      fs.mkdirSync(albumDir, { recursive: true });
      cb(null, albumDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req: MulterRequest, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const ext = path.extname(file.originalname);
    cb(null, 'cover' + ext);
  },
});
const coverUpload = multer({ storage: coverUpdateStorage });

// POST /api/albums/:id/cover - upload and store album cover as file
router.post('/:id/cover', coverUpload.single('cover'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const albumId = parseInt(req.params.id, 10);
    if (isNaN(albumId)) return res.status(400).json({ error: 'Invalid album id' });
    
    // Get album to construct the proper image_url path
    const album = await prisma.album.findUnique({ where: { id: albumId } });
    if (!album) return res.status(404).json({ error: 'Album not found' });
    
    const sanitizedTitle = sanitizeFolderName(album.title);
    const image_url = `albums/${sanitizedTitle}/${req.file.filename}`;
    
    // Update the album with the new image_url and clear any old cover_blob
    const updatedAlbum = await prisma.album.update({
      where: { id: albumId },
      data: { 
        image_url: image_url,
        cover_blob: null // Clear blob data since we're using file-based storage
      },
    });
    
    res.json({ success: true, album: updatedAlbum });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to upload cover' });
  }
});

// GET /api/albums/:id/cover - serve the album cover image from file system
router.get('/:id/cover', async (req, res) => {
  try {
    const albumId = parseInt(req.params.id, 10);
    if (isNaN(albumId)) return res.status(400).send('Invalid album id');
    
    const album = await prisma.album.findUnique({ where: { id: albumId } });
    if (!album) return res.status(404).send('Album not found');
    
    // Set cache headers for better performance
    res.set({
      'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      'ETag': `"album-${albumId}-${album.updatedAt.getTime()}"`,
      'Last-Modified': album.updatedAt.toUTCString()
    });
    
    // Check if client has cached version
    const ifNoneMatch = req.headers['if-none-match'];
    const etag = `"album-${albumId}-${album.updatedAt.getTime()}"`;
    if (ifNoneMatch === etag) {
      return res.status(304).send(); // Not modified
    }
    
    // If we have image_url, serve the file
    if (album.image_url && !album.image_url.startsWith('http')) {
      const filePath = path.join(UPLOADS_BASE_PATH, album.image_url);
      if (fs.existsSync(filePath)) {
        return res.sendFile(path.resolve(filePath));
      }
    }
    
    // Fallback to blob if it exists (for legacy data)
    if (album.cover_blob) {
      res.set('Content-Type', 'image/jpeg');
      return res.send(Buffer.from(album.cover_blob));
    }
    
    // No cover found
    return res.status(404).send('No cover image');
  } catch (error) {
    res.status(500).send('Failed to fetch cover image');
  }
});

export default router; 