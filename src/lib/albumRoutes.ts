const express2 = require('express');
const { getAlbums: getAlbums2 } = require('./albumApi');
const fs = require('fs');
const path2 = require('path');
const { PrismaClient } = require('@prisma/client');
const multer2 = require('multer');
const mm = require('music-metadata');

const router = express2.Router();
const prisma2 = new PrismaClient();

// Multer storage config for album images
const storage = multer2.diskStorage({
  destination: (req, file, cb) => {
    const albumName = req.body.title || 'untitled_album';
    const albumDir = path2.join(UPLOADS_BASE_PATH, albumName);
    fs.mkdirSync(albumDir, { recursive: true });
    cb(null, albumDir);
  },
  filename: (req, file, cb) => {
    const ext = path2.extname(file.originalname);
    cb(null, 'cover' + ext);
  },
});
const upload = multer2({ storage });

// Multer storage config for track audio files
const trackStorage = multer2.diskStorage({
  destination: (req, file, cb) => {
    const albumId = req.params.albumId || 'unknown_album';
    const albumDir = path2.join(UPLOADS_BASE_PATH, 'albums', albumId, 'tracks');
    fs.mkdirSync(albumDir, { recursive: true });
    cb(null, albumDir);
  },
  filename: (req, file, cb) => {
    const ext = path2.extname(file.originalname);
    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueId + ext);
  },
});
const trackUpload = multer2({ storage: trackStorage });

// Add endpoints for album cover blob upload and serving
const upload2 = multer2(); // memory storage for blob

// GET /api/albums - fetch all albums
router.get('/', async (req, res) => {
  try {
    const albums = await getAlbums2();
    res.status(200).json(albums);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/albums - create album with optional image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, artist, year, track_count, duration, description, genre } = req.body;
    if (!title || !artist) {
      return res.status(400).json({ error: 'Title and artist are required' });
    }
    let image_url = null;
    if (req.file) {
      image_url = path2.join(title, req.file.filename).replace(/\\/g, '/');
    }
    const album = await prisma2.album.create({
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
    if (!image_url) {
      const placeholderUrl = `https://placehold.co/300x300.png?text=Album+${album.id}`;
      await prisma2.album.update({ where: { id: album.id }, data: { image_url: placeholderUrl } });
      album.image_url = placeholderUrl;
    }
    res.status(201).json(album);
  } catch (error) {
    console.error('Album creation error:', error && error.stack ? error.stack : error);
    console.error('Request body:', req.body);
    console.error('Request file:', req.file);
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
});

// GET /:id - fetch a single album by id
router.get('/:id', async (req, res) => {
  try {
    const albumId = parseInt(req.params.id, 10);
    if (isNaN(albumId)) {
      return res.status(400).json({ error: 'Invalid album id' });
    }
    let album = await prisma2.album.findUnique({ where: { id: albumId } });
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
    // Derive title from file name (without extension)
    const originalName = req.file.originalname;
    const title = originalName.replace(/\.[^/.]+$/, "");
    const artist = req.body.artist || 'Unknown Artist';
    const genre = 'Rock';
    const audioPath = path2.relative(UPLOADS_BASE_PATH, req.file.path).replace(/\\/g, '/');
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
    const song = await prisma2.song.create({
      data: {
        title,
        artist,
        url: audioPath,
        albumId: albumId,
        duration,
        genre,
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
    const tracks = await prisma2.song.findMany({ where: { albumId } });
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
    const album = await prisma2.album.update({
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
    const album = await prisma2.album.findUnique({ where: { id: albumId } });
    if (!album || !album.cover_blob) return res.status(404).send('No cover image');
    res.set('Content-Type', 'image/jpeg');
    res.send(Buffer.from(album.cover_blob));
  } catch (error) {
    res.status(500).send('Failed to fetch cover image');
  }
});

module.exports = router; 