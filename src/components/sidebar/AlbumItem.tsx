import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getApiUrl } from '@/lib/config';
import { useImageCache } from '@/hooks/use-image-cache';

interface AlbumItemProps {
  album: {
    id: number;
    title: string;
    artist: string;
    image_url?: string;
  };
}

const AlbumItem: React.FC<AlbumItemProps> = ({ album }) => {
  // Always use the API endpoint for consistency
  const imageUrl = album.id 
    ? getApiUrl(`/api/albums/${album.id}/cover`)
    : '/placeholder.svg';

  // Use the image cache hook for better performance
  const { imageUrl: cachedImageUrl, isLoading: imageLoading, error: imageError } = useImageCache(imageUrl);

  return (
    <Link 
      to={`/albums/${album.id}`} 
      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <div className="relative flex-shrink-0" style={{ width: 40, height: 40 }}>
        {imageLoading && (
          <div className="absolute inset-0 bg-muted rounded flex items-center justify-center">
            <div className="w-4 h-4 bg-muted-foreground/20 rounded"></div>
          </div>
        )}
        <img
          src={cachedImageUrl}
          alt={album.title}
          className={`object-cover rounded transition-opacity duration-200 ${
            !imageLoading ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ width: 40, height: 40 }}
          loading="eager"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-foreground">
          {album.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {album.artist}
        </p>
      </div>
    </Link>
  );
};

export default AlbumItem;
