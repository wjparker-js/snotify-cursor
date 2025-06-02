import React from 'react';
import { PlayCircle, Heart, Plus, MoreHorizontal } from 'lucide-react';

interface AlbumHeaderProps {
  cover: string;
  title: string;
  artist: string;
  year?: string;
  stats?: {
    plays?: number;
    likes?: number;
  };
  onPlay?: () => void;
  onLike?: () => void;
  onAdd?: () => void;
  onMore?: () => void;
}

export const AlbumHeader: React.FC<AlbumHeaderProps> = ({
  cover,
  title,
  artist,
  year,
  stats,
  onPlay,
  onLike,
  onAdd,
  onMore,
}) => (
  <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8 mb-8 min-h-[18rem]">
    {/* Blurred/gradient background */}
    <div
      className="absolute inset-0 z-0 rounded-xl overflow-hidden"
      style={{
        background: `linear-gradient(120deg, var(--color-bg), var(--color-bg-secondary) 80%)`,
        filter: 'blur(0px)',
      }}
    >
      <img
        src={cover}
        alt=""
        className="w-full h-full object-cover opacity-30 blur-md scale-110"
        aria-hidden
      />
    </div>
    {/* Album cover */}
    <div className="relative z-10 flex-shrink-0">
      <img
        src={cover}
        alt={title}
        className="w-40 h-40 md:w-56 md:h-56 rounded-xl shadow-lg object-cover border-4 border-bg"
      />
      {/* Sticky play button (bottom right of cover on desktop, below on mobile) */}
      <button
        className="absolute -bottom-4 right-4 md:right-0 md:-bottom-4 z-20 bg-black/70 rounded-full p-1 shadow-lg hover:scale-105 transition"
        style={{ outline: 'none' }}
        aria-label="Play album"
        onClick={onPlay}
      >
        <PlayCircle className="w-16 h-16 text-highlight" />
      </button>
    </div>
    {/* Album info and quick actions */}
    <div className="relative z-10 flex-1 text-left md:pl-8 flex flex-col justify-end">
      <div className="flex items-center mb-2">
        <div className="text-sm text-muted mr-4">Album</div>
        {/* Quick action icons */}
        <div className="flex items-center space-x-2 ml-auto">
          <button onClick={onLike} className="hover:text-pink-500 focus:outline-none" aria-label="Like album">
            <Heart className="w-7 h-7" />
          </button>
          <button onClick={onAdd} className="hover:text-green-500 focus:outline-none" aria-label="Add album to playlist">
            <Plus className="w-7 h-7" />
          </button>
          <button onClick={onMore} className="hover:text-highlight focus:outline-none" aria-label="More options">
            <MoreHorizontal className="w-7 h-7" />
          </button>
        </div>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-text mb-2">{title}</h1>
      <div className="text-lg text-highlight font-semibold mb-1">{artist}</div>
      {year && <div className="text-sm text-muted mb-2">{year}</div>}
      <div className="flex items-center space-x-6 mt-2">
        {stats?.plays !== undefined && (
          <div className="text-sm text-muted"><span className="font-bold text-text">{stats.plays}</span> plays</div>
        )}
        {stats?.likes !== undefined && (
          <div className="text-sm text-muted"><span className="font-bold text-text">{stats.likes}</span> likes</div>
        )}
      </div>
    </div>
  </div>
); 