import express from 'express';
import type { Request, Response } from 'express';
import { getSongs, getSongsByAlbum, getSongById, createSong, updateSong, deleteSong } from './trackApi.js';

const router = express.Router();

// GET /api/songs - fetch all songs
router.get('/', async (req: Request, res: Response) => {
  try {
    const songs = await getSongs();
    res.status(200).json(songs);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// GET /api/songs/album/:albumId - fetch songs by album
router.get('/album/:albumId', async (req: Request, res: Response) => {
  try {
    const albumId = parseInt(req.params.albumId, 10);
    if (isNaN(albumId)) {
      return res.status(400).json({ error: 'Invalid album ID' });
    }
    const songs = await getSongsByAlbum(albumId);
    res.status(200).json(songs);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// GET /api/songs/:id - fetch a single song by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const songId = parseInt(req.params.id, 10);
    if (isNaN(songId)) {
      return res.status(400).json({ error: 'Invalid song ID' });
    }
    const song = await getSongById(songId);
    res.status(200).json(song);
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// POST /api/songs - create a new song
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, artist, url, albumId, duration, genre } = req.body;
    
    if (!title || !artist || !url || !albumId) {
      return res.status(400).json({ 
        error: 'Title, artist, url, and albumId are required' 
      });
    }

    const albumIdNum = parseInt(albumId, 10);
    if (isNaN(albumIdNum)) {
      return res.status(400).json({ error: 'Invalid album ID' });
    }

    const song = await createSong({
      title,
      artist,
      url,
      albumId: albumIdNum,
      duration,
      genre,
    });

    res.status(201).json(song);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// PUT /api/songs/:id - update a song
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const songId = parseInt(req.params.id, 10);
    if (isNaN(songId)) {
      return res.status(400).json({ error: 'Invalid song ID' });
    }

    const { title, artist, url, albumId, duration, genre } = req.body;
    const updateData: any = {};

    if (title) updateData.title = title;
    if (artist) updateData.artist = artist;
    if (url) updateData.url = url;
    if (albumId) {
      const albumIdNum = parseInt(albumId, 10);
      if (isNaN(albumIdNum)) {
        return res.status(400).json({ error: 'Invalid album ID' });
      }
      updateData.albumId = albumIdNum;
    }
    if (duration) updateData.duration = duration;
    if (genre) updateData.genre = genre;

    const song = await updateSong(songId, updateData);
    res.status(200).json(song);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// DELETE /api/songs/:id - delete a song
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const songId = parseInt(req.params.id, 10);
    if (isNaN(songId)) {
      return res.status(400).json({ error: 'Invalid song ID' });
    }

    await deleteSong(songId);
    res.status(200).json({ message: 'Song deleted successfully' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

export default router; 