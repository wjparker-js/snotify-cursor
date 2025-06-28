import React from 'react';
import { PlaylistCard } from './PlaylistCard';

interface Playlist {
  id: string | number;
  cover: string;
  title: string;
  owner: string;
}

interface PlaylistGridProps {
  playlists: Playlist[];
  onPlaylistClick?: (playlist: Playlist) => void;
  onPlaylistAdded?: () => void;
  loading?: boolean;
}

export const PlaylistGrid: React.FC<PlaylistGridProps> = ({ playlists, onPlaylistClick, onPlaylistAdded, loading }) => {
  if (loading) {
    return <div className="text-muted text-center py-12">Loading playlists...</div>;
  }
  if (!playlists || playlists.length === 0) {
    return <div className="text-muted text-center py-12">No playlists found.</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mobile-single-col mobile-center">
      {playlists.map((playlist) => (
        <div key={playlist.id} className="mobile-card-size">
          <PlaylistCard
            playlist={playlist}
          />
        </div>
      ))}
    </div>
  );
}; 