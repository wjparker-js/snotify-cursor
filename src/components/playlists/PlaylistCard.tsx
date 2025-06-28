import React from 'react';
import { Link } from 'react-router-dom';
import { useImageCache } from '@/hooks/use-image-cache';

interface PlaylistCardProps {
  playlist: {
    id: string | number;
    cover: string;
    title: string;
    owner: string;
  };
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  // Use the image cache hook for better performance
  const { imageUrl: cachedImageUrl, isLoading: imageLoading, error: imageError } = useImageCache(playlist.cover);

  return (
    <Link to={`/playlist/${playlist.id}`} className="block group w-full">
      <div
        className="bg-background rounded-lg shadow-md p-4 flex flex-col items-center group hover:shadow-lg transition-all w-full cursor-pointer"
        style={{ overflow: 'hidden' }}
        tabIndex={0}
        role="button"
        aria-label={`View playlist ${playlist.title} by ${playlist.owner}`}
      >
        <div className="relative w-full flex justify-center mb-3">
          <div className="relative w-[85vw] max-w-[400px] sm:w-[116px] sm:h-[116px] aspect-square">
            {imageLoading && (
              <div className="absolute inset-0 bg-muted rounded-md flex items-center justify-center">
                <div className="text-muted-foreground text-xs">Loading...</div>
              </div>
            )}
            <img
              src={cachedImageUrl}
              alt={playlist.title}
              className={`w-full h-full object-cover rounded-md transition-opacity duration-200 ${
                !imageLoading ? 'opacity-100' : 'opacity-0'
              }`}
              loading="eager"
            />
          </div>
        </div>
        <div className="w-full text-center">
          <h3 className="font-semibold text-base truncate">{playlist.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{playlist.owner}</p>
        </div>
      </div>
    </Link>
  );
}; 