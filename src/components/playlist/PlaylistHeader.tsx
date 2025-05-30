
import React from 'react';

interface PlaylistHeaderProps {
  title: string;
  description: string | null;
  imageUrl: string | null;
  owner: string;
  trackCount: number;
}

const PlaylistHeader: React.FC<PlaylistHeaderProps> = ({
  title,
  description,
  imageUrl,
  owner,
  trackCount
}) => {
  return (
    <div className="px-4 pt-3 pb-2 flex items-end gap-4 bg-black">
      <div className="w-28 h-28 shadow-lg flex-shrink-0 flex items-center justify-center">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <span className="text-3xl font-bold text-zinc-600">
              {title[0]}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col">
        <span className="uppercase text-xs font-medium mb-1">Playlist</span>
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        
        {description && (
          <p className="text-xs text-zinc-400 mb-1">{description}</p>
        )}
        
        <div className="flex items-center text-xs text-zinc-400">
          <span className="font-medium">{owner}</span>
          <span className="mx-1">•</span>
          <span>{trackCount} {trackCount === 1 ? 'song' : 'songs'}</span>
        </div>
      </div>
    </div>
  );
};

export default PlaylistHeader;
