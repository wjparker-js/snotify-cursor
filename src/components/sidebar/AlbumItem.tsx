import React from 'react';
import { Link } from 'react-router-dom';

interface Album {
  id: number;
  title: string;
  artist: string;
}

interface AlbumItemProps {
  album: Album;
}

const AlbumItem: React.FC<AlbumItemProps> = ({ album }) => {
  // Use proxy URL with cache busting
  const imageUrl = album.id 
    ? `/api/albums/${album.id}/cover?t=${Date.now()}`
    : '/placeholder.svg';

  return (
    <Link 
      to={`/album/${album.id}`} 
      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50 transition-colors group"
    >
      <div className="w-12 h-12 flex-shrink-0">
        <img
          src={imageUrl}
          alt={album.title}
          className="w-full h-full object-cover rounded-md"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium line-clamp-1">{album.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{album.artist}</p>
      </div>
    </Link>
  );
};

export default AlbumItem;
