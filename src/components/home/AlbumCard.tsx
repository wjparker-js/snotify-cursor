import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// TODO: Implement album card functionality using MySQL/Prisma and local file storage. Supabase logic removed.

const getAlbumImageUrl = (image_url: string | null | undefined) => {
  if (!image_url) return '/placeholder.svg';
  // If the image_url is an absolute URL (http/https), use as is
  if (/^https?:\/\//i.test(image_url)) return image_url;
  // Otherwise, treat as relative and prefix with backend uploads URL
  return `http://localhost:4000/uploads/${image_url.replace(/^\/+|\\/g, '/')}`;
};

const AlbumCard: React.FC<{ album: any; onPlay?: (album: any) => void }> = ({ album, onPlay }) => {
  const imageUrl = album.id ? `/api/albums/${album.id}/cover` : '/placeholder.svg';
  return (
    <Link to={`/albums/${album.id}`} className="block group w-full">
      <div className="bg-background rounded-lg shadow-md p-4 flex flex-col items-center group hover:shadow-lg transition-all w-full" style={{ overflow: 'hidden' }}>
        <div className="relative w-full flex justify-center mb-3">
          <img
            src={imageUrl}
            alt={album.title}
            className="object-cover rounded-md mobile-card-image"
            style={{ width: 116, height: 116, maxWidth: '100%', maxHeight: '100%' }}
            onError={e => (e.currentTarget.src = '/placeholder.svg')}
          />
          <Button
            variant="default"
            size="icon"
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              if (onPlay) onPlay(album);
            }}
            aria-label={`Play ${album.title}`}
          >
            <Play className="w-5 h-5" />
          </Button>
        </div>
        <div className="w-full text-center">
          <h3 className="font-semibold text-base truncate">{album.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{album.artist}</p>
        </div>
      </div>
    </Link>
  );
};

export default AlbumCard;
