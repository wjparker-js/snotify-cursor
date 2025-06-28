import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getApiUrl } from '@/lib/config';

interface Album {
  id: number;
  title: string;
  artist: string;
}

interface AlbumCardProps {
  album: Album;
}

const AlbumCard = React.memo<AlbumCardProps>(({ album }) => {
  // Try using proxy URL instead of direct backend URL
  const imageUrl = album.id 
    ? `/api/albums/${album.id}/cover?t=${Date.now()}`
    : '/placeholder.svg';

  return (
    <Link to={`/album/${album.id}`} className="block group">
      <div className="bg-card rounded-lg p-4 hover:bg-accent/50 transition-colors">
        <div className="aspect-square mb-3 relative">
          <img
            src={imageUrl}
            alt={album.title}
            className="w-full h-full object-cover rounded-md"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Play className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <h3 className="font-medium text-sm mb-1 line-clamp-1">{album.title}</h3>
        <p className="text-muted-foreground text-xs line-clamp-1">{album.artist}</p>
      </div>
    </Link>
  );
});

AlbumCard.displayName = 'AlbumCard';

export default AlbumCard;
