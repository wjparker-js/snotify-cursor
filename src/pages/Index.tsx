import React, { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import AlbumCard from '@/components/home/AlbumCard';
import AddAlbumDialog from '@/components/album/AddAlbumDialog';
import { useMobileResponsive } from '@/hooks/use-mobile-responsive';

// TODO: Implement album fetching and homepage content using MySQL/Prisma. Supabase logic removed.

const Index: React.FC = () => {
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isMobile } = useMobileResponsive();

  const fetchAlbums = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/api/albums');
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
    <div className="p-6 mobile-center" style={{ overflowX: 'hidden' }}>
      <div className="flex items-center justify-between mb-6 w-full max-w-6xl">
        <h1 className="text-2xl font-bold">Albums</h1>
        <div className="flex items-center gap-2">
          <AddAlbumDialog onAlbumAdded={fetchAlbums} />
        </div>
      </div>
      
      {isLoading && <p className="text-muted-foreground w-full max-w-6xl">Loading albums...</p>}
      {error && <p className="text-destructive mb-4 w-full max-w-6xl">{error}</p>}
      
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mobile-single-col mobile-center">
          {albums.map(album => (
            <div key={album.id} className="mobile-card-size">
              <AlbumCard album={album} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;