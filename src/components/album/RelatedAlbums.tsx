import React from 'react';
import AlbumCard from '@/components/home/AlbumCard';

const getAlbumImageUrl = (image_url: string | null | undefined) => {
  if (!image_url) return '/placeholder.svg';
  if (/^https?:\/\//i.test(image_url)) return image_url;
  return `http://localhost:4000/uploads/${image_url.replace(/^\/+|\\/g, '/')}`;
};

interface Album {
  id: string;
  title: string;
  artist: string;
  image_url: string | null;
  year?: string | null;
}

interface RelatedAlbumsProps {
  albums: Album[];
  artist: string;
}

const RelatedAlbums: React.FC<RelatedAlbumsProps> = ({ albums, artist }) => {
  if (!albums || albums.length === 0) return null;

  return (
    <div className="w-full px-0 pt-1 pb-2">
      <h3 className="text-xl font-bold mb-3">More by {artist}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-2">
        {albums.map(album => (
          <AlbumCard key={album.id} album={{ ...album, image_url: getAlbumImageUrl(album.image_url) }} />
        ))}
      </div>
    </div>
  );
};

export default RelatedAlbums;
