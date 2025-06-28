import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import * as playlistApi from './playlistApi.js';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { verifyJWT } from './authApi.js';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = express.Router();
const upload = multer(); // memory storage for blob

// Authentication middleware
function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }
  try {
    const payload = verifyJWT(auth.split(' ')[1]);
    req.user = payload;
    next();
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// GET /api/playlists - get playlists for authenticated user
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const playlists = await playlistApi.getPlaylistsByUserId(req.user?.userId);
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
    
    // Set cache headers for better performance
    res.set({
      'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      'ETag': `"playlist-${playlist.id}-${playlist.updatedAt.getTime()}"`,
      'Last-Modified': playlist.updatedAt.toUTCString(),
      'Content-Type': 'image/jpeg'
    });
    
    // Check if client has cached version
    const ifNoneMatch = req.headers['if-none-match'];
    const etag = `"playlist-${playlist.id}-${playlist.updatedAt.getTime()}"`;
    if (ifNoneMatch === etag) {
      return res.status(304).send(); // Not modified
    }
    
    res.send(Buffer.from(playlist.cover_blob));
  } catch (error) {
    res.status(500).send('Failed to fetch cover image');
  }
});

// POST /api/playlists - create new playlist
router.post('/', requireAuth, upload.single('image'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }
    if (name.length > 100) {
      return res.status(400).json({ error: 'Playlist name must be 100 characters or less' });
    }
    
    let playlist = await playlistApi.createPlaylist(name.trim(), description || '', req.user?.userId);
    
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
router.post('/:id/songs', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { songId } = req.body;
    if (!songId) {
      return res.status(400).json({ error: 'Song ID is required' });
    }
    
    // Verify the playlist belongs to the authenticated user
    const playlist = await playlistApi.getPlaylistById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    if (playlist.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'You can only add songs to your own playlists' });
    }
    
    const updatedPlaylist = await playlistApi.addSongToPlaylist(req.params.id, songId);
    res.json(updatedPlaylist);
  } catch (error: any) {
    if (error.message === 'Song is already in this playlist') {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message || 'Failed to add song to playlist' });
    }
  }
});

// DELETE /api/playlists/:id/songs/:songId - remove song from playlist
router.delete('/:id/songs/:songId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Verify the playlist belongs to the authenticated user
    const playlist = await playlistApi.getPlaylistById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    if (playlist.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'You can only remove songs from your own playlists' });
    }
    
    await playlistApi.removeSongFromPlaylist(req.params.id, req.params.songId);
    res.json({ success: true, message: 'Song removed from playlist' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to remove song from playlist' });
  }
});

export default router; 