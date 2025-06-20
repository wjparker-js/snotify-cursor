import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface AlbumItemProps {
  album: {
    id: number;
    title: string;
    artist: string;
    image_url?: string;
  };
}

const getAlbumImageUrl = (image_url: string | null | undefined) => {
  if (!image_url) return '/placeholder.svg';
  // If the image_url is an absolute URL (http/https), use as is
  if (/^https?:\/\//i.test(image_url)) return image_url;
  // Otherwise, treat as relative and prefix with backend uploads URL
  return `http://localhost:4000/uploads/${image_url.replace(/^\/+|\\+/g, '')}`;
};

const AlbumItem: React.FC<AlbumItemProps> = ({ album }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [displayImageSrc, setDisplayImageSrc] = useState('/placeholder.svg');
  
  // Use the album's image_url field directly, with fallback to cover endpoint
  const imageUrl = !imageError && album.image_url 
    ? getAlbumImageUrl(album.image_url)
    : album.id 
      ? `http://localhost:4000/api/albums/${album.id}/cover`
      : '/placeholder.svg';

  // Preload the image and set display src only when loaded
  useEffect(() => {
    if (imageUrl && imageUrl !== '/placeholder.svg') {
      const img = new Image();
      img.onload = () => {
        setDisplayImageSrc(imageUrl);
        setImageLoaded(true);
      };
      img.onerror = () => {
        setImageError(true);
        setDisplayImageSrc('/placeholder.svg');
        setImageLoaded(true);
      };
      img.src = imageUrl;
    } else {
      setDisplayImageSrc('/placeholder.svg');
      setImageLoaded(true);
    }
  }, [imageUrl]);

  return (
    <Link 
      to={`/albums/${album.id}`} 
      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <div className="relative flex-shrink-0" style={{ width: 40, height: 40 }}>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted rounded flex items-center justify-center">
            <div className="w-4 h-4 bg-muted-foreground/20 rounded"></div>
          </div>
        )}
        <img
          src={displayImageSrc}
          alt={album.title}
          className={`object-cover rounded transition-opacity duration-200 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
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
