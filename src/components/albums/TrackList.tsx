import React from 'react';
import { TrackRow } from './TrackRow';

interface Track {
  id: string | number;
  number: number;
  title: string;
  artist: string;
  duration: string;
}

interface TrackListProps {
  tracks: Track[];
  isAdmin?: boolean;
  onPlay?: (track: Track) => void;
  onLike?: (track: Track) => void;
  onAdd?: (track: Track) => void;
  onDelete?: (track: Track) => void;
}

export const TrackList: React.FC<TrackListProps> = ({ tracks, isAdmin, onPlay, onLike, onAdd, onDelete }) => {
  if (!tracks || tracks.length === 0) {
    return <div className="text-muted text-center py-8">No tracks found.</div>;
  }
  // Demo handlers
  const handlePlay = (track: Track) => alert(`Play track: ${track.title}`);
  const handleLike = (track: Track) => alert(`Like track: ${track.title}`);
  const handleAdd = (track: Track) => alert(`Add track to playlist: ${track.title}`);
  const handleDelete = async (track: Track) => {
    if (!confirm(`Are you sure you want to delete "${track.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/songs/${track.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete track');
      }

      // Refresh the page or notify parent component to update the track list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting track:', error);
      alert('Failed to delete track. Please try again.');
    }
  };

  return (
    <div className="divide-y divide-bg-secondary rounded-xl overflow-hidden bg-card">
      {tracks.map((track) => (
        <TrackRow
          key={track.id}
          track={track}
          isAdmin={isAdmin}
          onPlay={() => (onPlay ? onPlay(track) : handlePlay(track))}
          onLike={() => (onLike ? onLike(track) : handleLike(track))}
          onAdd={() => (onAdd ? onAdd(track) : handleAdd(track))}
          onDelete={() => (onDelete ? onDelete(track) : handleDelete(track))}
        />
      ))}
    </div>
  );
}; 