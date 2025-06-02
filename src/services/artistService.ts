import { Artist, Album, Track } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const artistService = {
  async getArtist(id: string): Promise<Artist> {
    const response = await fetch(`${API_BASE_URL}/artists/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch artist');
    }
    return response.json();
  },

  async getArtistAlbums(artistId: string): Promise<Album[]> {
    const response = await fetch(`${API_BASE_URL}/artists/${artistId}/albums`);
    if (!response.ok) {
      throw new Error('Failed to fetch artist albums');
    }
    return response.json();
  },

  async getArtistPopularTracks(artistId: string): Promise<Track[]> {
    const response = await fetch(`${API_BASE_URL}/artists/${artistId}/tracks/popular`);
    if (!response.ok) {
      throw new Error('Failed to fetch popular tracks');
    }
    return response.json();
  },

  async followArtist(artistId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/artists/${artistId}/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to follow artist');
    }
  },

  async unfollowArtist(artistId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/artists/${artistId}/follow`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to unfollow artist');
    }
  },
}; 