import React from 'react';
import { ArtistCard } from './ArtistCard';

interface Artist {
  id: string | number;
  cover: string;
  name: string;
}

interface ArtistGridProps {
  artists: Artist[];
  onArtistClick?: (artist: Artist) => void;
  loading?: boolean;
}

export const ArtistGrid: React.FC<ArtistGridProps> = ({ artists, onArtistClick, loading }) => {
  if (loading) {
    return <div className="text-muted text-center py-12">Loading artists...</div>;
  }
  if (!artists || artists.length === 0) {
    return <div className="text-muted text-center py-12">No artists found.</div>;
  }
  // Demo handlers
  const handlePlay = (artist: Artist) => alert(`Play artist: ${artist.name}`);
  const handleFollow = (artist: Artist) => alert(`Follow artist: ${artist.name}`);
  const handleMore = (artist: Artist) => alert(`More options for: ${artist.name}`);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {artists.map((artist) => (
        <ArtistCard
          key={artist.id}
          artist={artist}
          onClick={() => onArtistClick?.(artist)}
          onPlay={() => handlePlay(artist)}
          onFollow={() => handleFollow(artist)}
          onMore={() => handleMore(artist)}
        />
      ))}
    </div>
  );
}; 