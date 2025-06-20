import express from 'express';
import type { Request, Response } from 'express';
import * as playlistApi from './playlistApi.js';
import multer from 'multer';

const router = express.Router();
const upload = multer(); // memory storage for blob

// GET /api/playlists - get all playlists
router.get('/', async (req: Request, res: Response) => {
  try {
    const playlists = await playlistApi.getPlaylists();
    res.json(playlists);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch playlists' });
  }
});

// GET /api/playlists/:id - get playlist by id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const playlist = await playlistApi.getPlaylistById(req.params.id);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    res.json(playlist);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch playlist' });
  }
});

// POST /api/playlists/:id/cover - upload and store playlist cover as blob
router.post('/:id/cover', upload.single('cover'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const playlist = await playlistApi.setPlaylistCoverBlob(req.params.id, req.file.buffer);
    res.json({ success: true, playlist });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to upload cover' });
  }
});

// GET /api/playlists/:id/cover - serve the playlist cover image blob
router.get('/:id/cover', async (req: Request, res: Response) => {
  try {
    const playlist = await playlistApi.getPlaylistById(req.params.id);
    if (!playlist || !playlist.cover_blob) return res.status(404).send('No cover image');
    res.set('Content-Type', 'image/jpeg'); // or detect type if needed
    res.send(Buffer.from(playlist.cover_blob));
  } catch (error) {
    res.status(500).send('Failed to fetch cover image');
  }
});

// POST /api/playlists - create new playlist
router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }
    if (name.length > 100) {
      return res.status(400).json({ error: 'Playlist name must be 100 characters or less' });
    }
    
    let playlist = await playlistApi.createPlaylist(name.trim(), description || '');
    
    // If image was uploaded, set it as cover
    if (req.file) {
      playlist = await playlistApi.setPlaylistCoverBlob(playlist.id.toString(), req.file.buffer);
    }
    
    res.status(201).json(playlist);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create playlist' });
  }
});

// PUT /api/playlists/:id - update playlist
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }
    if (name.length > 100) {
      return res.status(400).json({ error: 'Playlist name must be 100 characters or less' });
    }
    const playlist = await playlistApi.updatePlaylist(req.params.id, { name: name.trim(), description });
    res.json(playlist);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update playlist' });
  }
});

// DELETE /api/playlists/:id - delete playlist
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await playlistApi.deletePlaylist(req.params.id);
    res.json({ success: true, message: 'Playlist deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete playlist' });
  }
});

// POST /api/playlists/:id/songs - add song to playlist
router.post('/:id/songs', async (req: Request, res: Response) => {
  try {
    const { songId } = req.body;
    if (!songId) {
      return res.status(400).json({ error: 'Song ID is required' });
    }
    const playlist = await playlistApi.addSongToPlaylist(req.params.id, songId);
    res.json(playlist);
  } catch (error: any) {
    if (error.message === 'Song is already in this playlist') {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message || 'Failed to add song to playlist' });
    }
  }
});

// DELETE /api/playlists/:id/songs/:songId - remove song from playlist
router.delete('/:id/songs/:songId', async (req: Request, res: Response) => {
  try {
    await playlistApi.removeSongFromPlaylist(req.params.id, req.params.songId);
    res.json({ success: true, message: 'Song removed from playlist' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to remove song from playlist' });
  }
});

export default router; 