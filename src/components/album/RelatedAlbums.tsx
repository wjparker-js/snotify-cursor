import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { getApiUrl } from '@/lib/config';

interface Album {
  id: number;
  title: string;
  artist: string;
  year?: number;
  image_url?: string;
}

interface RelatedAlbumsProps {
  albums: Album[];
  artist: string;
}

const AlbumCard: React.FC<{ album: Album }> = ({ album }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [displayImageSrc, setDisplayImageSrc] = useState('/placeholder.svg');
  
  // Always use the API endpoint for consistency
  const imageUrl = album.id 
    ? getApiUrl(`/api/albums/${album.id}/cover`)
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
