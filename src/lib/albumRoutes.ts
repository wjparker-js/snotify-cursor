const express = require('express');
const { getAlbums } = require('./albumApi');
const fs = require('fs');
const path = require('path');
const prismaPath = path.resolve(__dirname, '../../generated/prisma/index.js');
console.log('Prisma client path:', prismaPath, fs.existsSync(prismaPath));
const { PrismaClient } = require(prismaPath);
const multer = require('multer');
const mm = require('music-metadata');

const router = express.Router();
const prisma = new PrismaClient();

const UPLOADS_BASE_PATH = process.env.UPLOADS_BASE_PATH || 'uploads';

// Multer storage config for album images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const albumName = req.body.title || 'untitled_album';
    const albumDir = path.join(UPLOADS_BASE_PATH, albumName);
    fs.mkdirSync(albumDir, { recursive: true });
    cb(null, albumDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'cover' + ext);
  },
});
const upload = multer({ storage });

// Multer storage config for track audio files
const trackStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const albumId = req.params.albumId || 'unknown_album';
    const albumDir = path.join(UPLOADS_BASE_PATH, 'albums', albumId, 'tracks');
    fs.mkdirSync(albumDir, { recursive: true });
    cb(null, albumDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueId + ext);
  },
});
const trackUpload = multer({ storage: trackStorage });

// GET /api/albums - fetch all albums
router.get('/', async (req, res) => {
  try {
    const albums = await getAlbums();
    res.status(200).json(albums);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/albums - create album with optional image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, artist, year, track_count, duration } = req.body;
    if (!title || !artist) {
      return res.status(400).json({ error: 'Title and artist are required' });
    }
    let image_url = null;
    if (req.file) {
      image_url = path.join(title, req.file.filename).replace(/\\/g, '/');
    }
    // Create album first to get the id
    const album = await prisma.album.create({
      data: {
        title,
        artist,
        image_url: image_url, // may be null for now
        year,
        track_count,
        duration,
      },
    });
    // If no image was uploaded, set placeholder URL with album id
    if (!image_url) {
      const placeholderUrl = `https://placehold.co/300x300.png?text=Album+${album.id}`;
      await prisma.album.update({ where: { id: album.id }, data: { image_url: placeholderUrl } });
      album.image_url = placeholderUrl;
    }
    res.status(201).json(album);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    // Derive title from file name (without extension)
    const originalName = req.file.originalname;
    const title = originalName.replace(/\.[^/.]+$/, "");
    const artist = req.body.artist || 'Unknown Artist';
    const genre = 'Rock';
    const audioPath = path.relative(UPLOADS_BASE_PATH, req.file.path).replace(/\\/g, '/');
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

module.exports = router; 