import React, { useEffect, useState } from 'react';
import { PlaylistGrid } from '@/components/playlists/PlaylistGrid';
import AddPlaylistDialog from '@/components/playlist/AddPlaylistDialog';
import { useMobileResponsive } from '@/hooks/use-mobile-responsive';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/config';

// TODO: Implement playlist fetching and management using MySQL/Prisma. Supabase logic removed.

const PLAYLIST_COVER_IMAGE = 'https://images-na.ssl-images-amazon.com/images/I/91rO1rQ1HLL.jpg';

const Playlists: React.FC = () => {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isMobile } = useMobileResponsive();
  const { user } = useAuth();

  // Helper function to get auth headers
      const getAuthHeaders = () => {
      const token = localStorage.getItem('jwt');
      return {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };
    };

  useEffect(() => {
    const fetchPlaylists = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(getApiUrl('/api/playlists'), {
          headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch playlists');
        // Use the blob endpoint for the cover image
        const mapped = data.map((playlist: any) => ({
          ...playlist,
          cover: getApiUrl(`/api/playlists/${playlist.id}/cover`),
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

    // Only fetch playlists if user is authenticated
    if (user) {
      fetchPlaylists();
    } else {
      setIsLoading(false);
      setError('Please sign in to view your playlists');
    }
  }, [user]);

  const handlePlaylistAdded = () => {
    // Refresh playlists after adding a new one
    setPlaylists([]);
    setIsLoading(true);
    const fetchPlaylists = async () => {
      try {
        const response = await fetch(getApiUrl('/api/playlists'), {
          headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch playlists');
        const mapped = data.map((playlist: any) => ({
          ...playlist,
          cover: getApiUrl(`/api/playlists/${playlist.id}/cover`),
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
  };

  if (isLoading) return <div className="text-muted text-center py-12">Loading playlists...</div>;
  if (error) return <div className="text-red-500 text-center py-12">{error}</div>;

  return (
    <div className="p-6 mobile-center" style={{ overflowX: 'hidden' }}>
      {/* Header with title and Add Playlist button in top right */}
      <div className="flex items-center justify-between mb-6 w-full max-w-6xl">
        <h1 className="text-2xl font-bold">Playlists</h1>
        <div className="flex items-center gap-2">
          {user && <AddPlaylistDialog onPlaylistAdded={handlePlaylistAdded} />}
        </div>
      </div>
      
      {/* Playlist Grid without the embedded Add button */}
      <div className="w-full max-w-6xl">
        <PlaylistGrid playlists={playlists} />
      </div>
    </div>
  );
};

export default Playlists;