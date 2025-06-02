import React from 'react';
import { Link } from 'react-router-dom';

interface PlaylistCardProps {
  playlist: {
    id: string | number;
    cover: string;
    title: string;
    owner: string;
  };
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  return (
    <Link to={`/playlist/${playlist.id}`} className="block group">
      <div
        className="bg-background rounded-lg shadow-md p-4 flex flex-col items-center group hover:shadow-lg transition-all w-full max-w-[240px] cursor-pointer"
        tabIndex={0}
        role="button"
        aria-label={`View playlist ${playlist.title} by ${playlist.owner}`}
      >
        <div className="relative w-full flex justify-center mb-3">
          <img
            src={playlist.cover}
            alt={playlist.title}
            className="object-cover rounded-md"
            style={{ width: 145, height: 145, maxWidth: '100%', maxHeight: '100%' }}
            onError={e => (e.currentTarget.src = '/placeholder.svg')}
          />
        </div>
        <div className="w-full text-center">
          <h3 className="font-semibold text-base truncate">{playlist.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{playlist.owner}</p>
        </div>
      </div>
    </Link>
  );
}; 