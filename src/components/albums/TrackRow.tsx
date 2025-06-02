import React, { useState } from 'react';
import { PlayCircle, Heart, Plus, Trash2 } from 'lucide-react';

interface TrackRowProps {
  track: {
    id: string | number;
    number: number;
    title: string;
    artist: string;
    duration: string;
  };
  isAdmin?: boolean;
  onPlay?: () => void;
  onLike?: () => void;
  onAdd?: () => void;
  onDelete?: () => void;
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, isAdmin, onPlay, onLike, onAdd, onDelete }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-center px-4 py-2 rounded-lg bg-card hover:bg-bg-secondary transition group cursor-pointer focus-within:ring-2 focus-within:ring-highlight"
      tabIndex={0}
      role="row"
      aria-label={`Track ${track.number}: ${track.title} by ${track.artist}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {/* Play button (appears on hover/focus) */}
      <button
        className={`mr-2 transition-opacity duration-150 ${hovered ? 'opacity-100' : 'opacity-0'}`}
        tabIndex={-1}
        aria-label="Play track"
        onClick={(e) => { e.stopPropagation(); onPlay?.(); }}
      >
        <PlayCircle className="w-7 h-7 text-highlight" />
      </button>
      <div className="w-8 text-muted-foreground text-center">{track.number}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate text-text">{track.title}</div>
        <div className="text-xs text-muted truncate">{track.artist}</div>
      </div>
      <div className="w-16 text-right text-muted-foreground font-mono">{track.duration}</div>
      <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition">
        <button onClick={(e) => { e.stopPropagation(); onLike?.(); }} className="hover:text-pink-500 focus:outline-none" tabIndex={-1} aria-label="Like track">
          <Heart className="w-5 h-5" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onAdd?.(); }} className="hover:text-green-500 focus:outline-none" tabIndex={-1} aria-label="Add to playlist">
          <Plus className="w-5 h-5" />
        </button>
        {isAdmin && (
          <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="hover:text-red-500 focus:outline-none" tabIndex={-1} aria-label="Delete track">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}; 