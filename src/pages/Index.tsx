import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import AlbumCard from '@/components/home/AlbumCard';
import AddAlbumDialog from '@/components/album/AddAlbumDialog';
import { useMobileResponsive } from '@/hooks/use-mobile-responsive';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '@/lib/config';
import { useAuth } from '@/context/AuthContext';

// Memoized album card component to prevent unnecessary re-renders
const MemoizedAlbumCard = React.memo(AlbumCard);

// Skeleton loader component for better perceived performance
const AlbumSkeleton = React.memo(() => (
  <div className="animate-pulse">
    <div className="bg-muted rounded-lg aspect-square mb-3"></div>
    <div className="h-4 bg-muted rounded mb-2"></div>
    <div className="h-3 bg-muted rounded w-3/4"></div>
  </div>
));

const Index: React.FC = () => {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isMobile } = useMobileResponsive();
  const { user } = useAuth();

  // Memoize admin check to prevent recalculation on every render
  const isAdmin = useMemo(() => {
    const allowedAdminEmails = ['wjparker@outlook.com', 'ghodgett59@gmail.com'];
    return user && allowedAdminEmails.includes(user.email);
  }, [user]);

  // Memoize fetch function to prevent recreation on every render
  const fetchAlbums = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(getApiUrl('/api/albums'), {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        // Add timeout and cache control for better performance
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAlbums(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch albums:', error);
      if (error.name !== 'AbortError') {
        setError(error.message || 'Failed to load albums');
        toast({
          title: 'Error',
          description: 'Failed to load albums. Please check if the server is running.',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  // Memoize the grid layout to prevent recalculation
  const albumGrid = useMemo(() => {
    if (loading) {
      // Show skeleton loaders while loading
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mobile-single-col mobile-center">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={`skeleton-${i}`} className="mobile-card-size">
              <AlbumSkeleton />
            </div>
          ))}
        </div>
      );
    }

    if (albums.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No albums found</p>
          {isAdmin && <p className="text-sm text-muted-foreground">Add your first album to get started!</p>}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mobile-single-col mobile-center">
        {albums.map(album => (
          <div key={album.id} className="mobile-card-size">
            <MemoizedAlbumCard album={album} />
          </div>
        ))}
      </div>
    );
  }, [albums, loading, isAdmin]);

  return (
    <div className="p-6 mobile-center" style={{ overflowX: 'hidden' }}>
      <div className="flex items-center justify-between mb-6 w-full max-w-6xl">
        <h1 className="text-2xl font-bold">Albums</h1>
        <div className="flex items-center gap-2">
          {isAdmin && <AddAlbumDialog onAlbumAdded={fetchAlbums} />}
        </div>
      </div>
      
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4 w-full max-w-6xl">
          <p className="text-destructive font-medium">Failed to load albums</p>
          <p className="text-destructive/80 text-sm mt-1">{error}</p>
          <button 
            onClick={fetchAlbums}
            className="mt-2 text-sm text-destructive hover:text-destructive/80 underline"
          >
            Try again
          </button>
        </div>
      )}
      
      <div className="w-full max-w-6xl">
        {albumGrid}
      </div>
    </div>
  );
};

export default React.memo(Index);