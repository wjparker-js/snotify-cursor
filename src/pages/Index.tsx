import React, { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import AlbumCard from '@/components/home/AlbumCard';
import AddAlbumDialog from '@/components/album/AddAlbumDialog';

// TODO: Implement album fetching and homepage content using MySQL/Prisma. Supabase logic removed.

const Index: React.FC = () => {
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  return (
    <div className="px-4 md:px-8 py-6 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Albums</h1>
        <AddAlbumDialog onAlbumAdded={fetchAlbums} />
      </div>
      {isLoading && <p className="text-muted-foreground">Loading albums...</p>}
      {error && <p className="text-destructive mb-4">{error}</p>}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full"
        role="list"
        aria-label="Album grid"
      >
        {albums.map(album => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
};

export default Index;