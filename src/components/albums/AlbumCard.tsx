import React, { useState } from 'react';
import { PlayCircle, Heart, Plus, MoreHorizontal } from 'lucide-react';

interface AlbumCardProps {
  album: {
    id: string | number;
    cover: string;
    title: string;
    artist: string;
  };
  onClick?: () => void;
  onPlay?: () => void;
  onLike?: () => void;
  onAdd?: () => void;
  onMore?: () => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album, onClick, onPlay, onLike, onAdd, onMore }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative bg-card rounded-xl shadow-md overflow-hidden transition hover:scale-105 hover:shadow-lg cursor-pointer group focus-within:ring-2 focus-within:ring-highlight"
      style={{ borderColor: 'var(--color-highlight)' }}
      tabIndex={0}
      role="button"
      aria-label={`View album ${album.title} by ${album.artist}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {/* Album cover */}
      <img
        src={album.cover}
        alt={album.title}
        className="w-full aspect-square object-cover transition"
        style={{ borderRadius: 'calc(var(--radius) - 0.25rem)' }}
      />
      {/* Gradient overlay for text */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/80 to-transparent z-10" />
      {/* Album info */}
      <div className="absolute bottom-0 left-0 w-full z-20 p-3 flex flex-col">
        <span className="font-bold text-lg text-white truncate drop-shadow-md">{album.title}</span>
        <span className="text-sm text-muted truncate drop-shadow-md">{album.artist}</span>
      </div>
      {/* Play button (centered, appears on hover/focus) */}
      <button
        className={`absolute inset-0 flex items-center justify-center z-30 transition-opacity duration-150 ${hovered ? 'opacity-100' : 'opacity-0'}`}
        style={{ outline: 'none' }}
        tabIndex={-1}
        aria-label="Play album"
        onClick={(e) => { e.stopPropagation(); onPlay?.(); }}
      >
        <PlayCircle className="w-16 h-16 text-highlight drop-shadow-lg bg-black/60 rounded-full" />
      </button>
      {/* Quick action icons (bottom right, fade in on hover) */}
      <div className={`absolute bottom-3 right-3 flex items-center space-x-2 z-30 transition-opacity duration-150 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={(e) => { e.stopPropagation(); onLike?.(); }} className="hover:text-pink-500 focus:outline-none" tabIndex={-1} aria-label="Like album">
          <Heart className="w-6 h-6" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onAdd?.(); }} className="hover:text-green-500 focus:outline-none" tabIndex={-1} aria-label="Add album to playlist">
          <Plus className="w-6 h-6" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onMore?.(); }} className="hover:text-highlight focus:outline-none" tabIndex={-1} aria-label="More options">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}; 