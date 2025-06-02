import React, { useEffect, useState } from 'react';
import { AlbumGrid } from '@/components/albums/AlbumGrid';
import { useRouter } from 'next/navigation';

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAlbumId, setActiveAlbumId] = useState<string | number | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const fetchAlbums = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/albums');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch albums');
        setAlbums(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlbums();
  }, []);

  const handleAlbumClick = (album: any) => {
    setActiveAlbumId(album.id);
    router.push(`/albums/${album.id}`); // Navigate to album details
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-white">Albums</h1>
      {isLoading && <div className="text-muted text-center py-12">Loading albums...</div>}
      {error && <div className="text-destructive text-center py-12">{error}</div>}
      {!isLoading && !error && <AlbumGrid albums={albums} onAlbumClick={handleAlbumClick} />}
    </div>
  );
} 