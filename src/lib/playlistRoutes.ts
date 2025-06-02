const express3 = require('express');
const router3 = express3.Router();
const playlistApi = require('./playlistApi');
const multer3 = require('multer');

const upload3 = multer3(); // memory storage for blob

// GET /api/playlists - get all playlists
router3.get('/', async (req, res) => {
  try {
    const playlists = await playlistApi.getPlaylists();
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch playlists' });
  }
});

// GET /api/playlists/:id - get playlist by id
router3.get('/:id', async (req, res) => {
  try {
    const playlist = await playlistApi.getPlaylistById(req.params.id);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch playlist' });
  }
});

// POST /api/playlists/:id/cover - upload and store playlist cover as blob
router3.post('/:id/cover', upload3.single('cover'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const playlist = await playlistApi.setPlaylistCoverBlob(req.params.id, req.file.buffer);
    res.json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to upload cover' });
  }
});

// GET /api/playlists/:id/cover - serve the playlist cover image blob
router3.get('/:id/cover', async (req, res) => {
  try {
    const playlist = await playlistApi.getPlaylistById(req.params.id);
    if (!playlist || !playlist.cover_blob) return res.status(404).send('No cover image');
    res.set('Content-Type', 'image/jpeg'); // or detect type if needed
    res.send(Buffer.from(playlist.cover_blob));
  } catch (error) {
    res.status(500).send('Failed to fetch cover image');
  }
});

module.exports = router3; 