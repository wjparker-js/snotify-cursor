import React, { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import AlbumCard from '@/components/home/AlbumCard';
import AddAlbumDialog from '@/components/album/AddAlbumDialog';
import { useMobileResponsive } from '@/hooks/use-mobile-responsive';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '@/lib/config';
import { useAuth } from '@/context/AuthContext';

// TODO: Implement album fetching and homepage content using MySQL/Prisma. Supabase logic removed.

const Index: React.FC = () => {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isMobile } = useMobileResponsive();
  const { user } = useAuth();

  // Define allowed admin emails
  const allowedAdminEmails = ['wjparker@outlook.com', 'ghodgett59@gmail.com'];
  
  // Check if current user is an admin
  const isAdmin = user && allowedAdminEmails.includes(user.email);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/albums'), {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await response.json();
      if (response.ok) {
        setAlbums(data);
      }
    } catch (error) {
      console.error('Failed to fetch albums:', error);
    } finally {
      setLoading(false);
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
          {isAdmin && <AddAlbumDialog onAlbumAdded={fetchAlbums} />}
        </div>
      </div>
      
      {loading && <p className="text-muted-foreground w-full max-w-6xl">Loading albums...</p>}
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