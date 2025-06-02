import React, { useEffect, useState } from 'react';
import { PlaylistGrid } from '@/components/playlists/PlaylistGrid';

// TODO: Implement playlist fetching and management using MySQL/Prisma. Supabase logic removed.

const PLAYLIST_COVER_IMAGE = 'https://images-na.ssl-images-amazon.com/images/I/91rO1rQ1HLL.jpg';

const Playlists: React.FC = () => {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/playlists');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch playlists');
        // Use the blob endpoint for the cover image
        const mapped = data.map((playlist: any) => ({
          ...playlist,
          cover: `/api/playlists/${playlist.id}/cover`,
          title: playlist.name,
          owner: playlist.user?.name || 'Unknown',
        }));
        setPlaylists(mapped);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch playlists');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaylists();
  }, []);

  if (isLoading) return <div className="text-muted text-center py-12">Loading playlists...</div>;
  if (error) return <div className="text-red-500 text-center py-12">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Playlists</h1>
      <PlaylistGrid playlists={playlists} />
    </div>
  );
};

export default Playlists;