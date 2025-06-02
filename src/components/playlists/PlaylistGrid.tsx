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
  loading?: boolean;
}

export const PlaylistGrid: React.FC<PlaylistGridProps> = ({ playlists, onPlaylistClick, loading }) => {
  if (loading) {
    return <div className="text-muted text-center py-12">Loading playlists...</div>;
  }
  if (!playlists || playlists.length === 0) {
    return <div className="text-muted text-center py-12">No playlists found.</div>;
  }
  // Demo handlers
  const handlePlay = (playlist: Playlist) => alert(`Play playlist: ${playlist.title}`);
  const handleLike = (playlist: Playlist) => alert(`Like playlist: ${playlist.title}`);
  const handleAdd = (playlist: Playlist) => alert(`Add playlist to library: ${playlist.title}`);
  const handleMore = (playlist: Playlist) => alert(`More options for: ${playlist.title}`);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {playlists.map((playlist) => (
        <PlaylistCard
          key={playlist.id}
          playlist={playlist}
          onClick={() => onPlaylistClick?.(playlist)}
          onPlay={() => handlePlay(playlist)}
          onLike={() => handleLike(playlist)}
          onAdd={() => handleAdd(playlist)}
          onMore={() => handleMore(playlist)}
        />
      ))}
    </div>
  );
}; 