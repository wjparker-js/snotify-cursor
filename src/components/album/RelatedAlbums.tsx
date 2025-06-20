import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Album {
  id: number;
  title: string;
  artist: string;
  image_url?: string;
}

interface RelatedAlbumsProps {
  albums: Album[];
}

const getAlbumImageUrl = (image_url: string | null | undefined) => {
  if (!image_url) return '/placeholder.svg';
  // If the image_url is an absolute URL (http/https), use as is
  if (/^https?:\/\//i.test(image_url)) return image_url;
  // Otherwise, treat as relative and prefix with backend uploads URL
  return `http://localhost:4000/uploads/${image_url.replace(/^\/+|\\+/g, '')}`;
};

const AlbumCard: React.FC<{ album: Album }> = ({ album }) => {
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
    <Link to={`/albums/${album.id}`} className="block group">
      <div className="bg-card rounded-lg p-4 hover:bg-accent transition-colors">
        <div className="relative mb-3" style={{ width: '100%', aspectRatio: '1' }}>
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted rounded-md flex items-center justify-center">
              <div className="text-muted-foreground text-xs">Loading...</div>
            </div>
          )}
          <img
            src={displayImageSrc}
            alt={album.title}
            className={`w-full h-full object-cover rounded-md transition-opacity duration-200 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="eager"
          />
        </div>
        <div>
          <h3 className="font-medium text-sm truncate">{album.title}</h3>
          <p className="text-xs text-muted-foreground truncate">{album.artist}</p>
        </div>
      </div>
    </Link>
  );
};

const RelatedAlbums: React.FC<RelatedAlbumsProps> = ({ albums }) => {
  if (!albums || albums.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Related Albums</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
};

export default RelatedAlbums;
