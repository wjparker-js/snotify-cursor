import React from 'react';
import { AlbumCard } from './AlbumCard';

interface Album {
  id: string | number;
  cover: string;
  title: string;
  artist: string;
}

interface AlbumGridProps {
  albums: Album[];
  onAlbumClick?: (album: Album) => void;
  loading?: boolean;
}

export const AlbumGrid: React.FC<AlbumGridProps> = ({ albums, onAlbumClick, loading }) => {
  if (loading) {
    return <div className="text-muted text-center py-12">Loading albums...</div>;
  }
  if (!albums || albums.length === 0) {
    return <div className="text-muted text-center py-12">No albums found.</div>;
  }
  // Demo handlers
  const handlePlay = (album: Album) => alert(`Play album: ${album.title}`);
  const handleLike = (album: Album) => alert(`Like album: ${album.title}`);
  const handleAdd = (album: Album) => alert(`Add album to playlist: ${album.title}`);
  const handleMore = (album: Album) => alert(`More options for: ${album.title}`);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {albums.map((album) => (
        <AlbumCard
          key={album.id}
          album={album}
          onClick={() => onAlbumClick?.(album)}
          onPlay={() => handlePlay(album)}
          onLike={() => handleLike(album)}
          onAdd={() => handleAdd(album)}
          onMore={() => handleMore(album)}
        />
      ))}
    </div>
  );
}; 