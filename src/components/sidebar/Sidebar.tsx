import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Disc, ListMusic } from 'lucide-react';

interface Album {
  id: number;
  title: string;
  artist: string;
  cover?: string;
}

interface Playlist {
  id: number;
  name: string;
  user?: { name: string };
  cover?: string;
}

const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'albums' | 'playlists'>('albums');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Set active tab based on current route
  useEffect(() => {
    if (location.pathname.includes('/playlist')) {
      setActiveTab('playlists');
    } else {
      setActiveTab('albums');
    }
  }, [location.pathname]);

  // Fetch albums data
  const fetchAlbums = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/albums');
      const data = await response.json();
      if (response.ok) {
        setAlbums(data);
      }
    } catch (error) {
      console.error('Failed to fetch albums:', error);
    }
  };

  // Fetch playlists data
  const fetchPlaylists = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/playlists');
      const data = await response.json();
      if (response.ok) {
        setPlaylists(data);
      }
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchAlbums(), fetchPlaylists()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleTabChange = (tab: 'albums' | 'playlists') => {
    setActiveTab(tab);
    // Navigate to the respective main page
    if (tab === 'albums') {
      navigate('/');
    } else {
      navigate('/playlists');
    }
  };

  const handleAlbumClick = (albumId: number) => {
    navigate(`/albums/${albumId}`);
  };

  const handlePlaylistClick = (playlistId: number) => {
    navigate(`/playlist/${playlistId}`);
  };

  const getAlbumCoverUrl = (albumId: number) => {
    return `http://localhost:4000/api/albums/${albumId}/cover`;
  };

  const getPlaylistCoverUrl = (playlistId: number) => {
    return `http://localhost:4000/api/playlists/${playlistId}/cover`;
  };

  if (isLoading) {
    return (
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col h-full">
        <div className="animate-pulse">
          <div className="flex space-x-1 mb-6">
            <div className="h-10 bg-gray-800 rounded flex-1"></div>
            <div className="h-10 bg-gray-800 rounded flex-1"></div>
          </div>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gray-800 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-800 rounded mb-2"></div>
                  <div className="h-3 bg-gray-800 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col h-full mobile-hide desktop-show">
      {/* Tab Buttons */}
      <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => handleTabChange('albums')}
          className={`flex items-center justify-center flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'albums'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Disc className="w-4 h-4 mr-2" />
          Albums
        </button>
        <button
          onClick={() => handleTabChange('playlists')}
          className={`flex items-center justify-center flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'playlists'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <ListMusic className="w-4 h-4 mr-2" />
          Playlists
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <div 
          className="h-full overflow-y-auto scrollbar-hide" 
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          <div className="space-y-2">
            {activeTab === 'albums' && albums.map((album) => (
              <div
                key={album.id}
                onClick={() => handleAlbumClick(album.id)}
                className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors duration-200 min-h-[80px]"
              >
                <img
                  src={getAlbumCoverUrl(album.id)}
                  alt={album.title}
                  className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                <div className="ml-3 flex-1 min-w-0">
                  <h3 className="text-white text-sm font-medium truncate">
                    {album.title}
                  </h3>
                  <p className="text-gray-400 text-xs truncate">
                    {album.artist}
                  </p>
                </div>
              </div>
            ))}

            {activeTab === 'playlists' && playlists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => handlePlaylistClick(playlist.id)}
                className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors duration-200 min-h-[80px]"
              >
                <img
                  src={getPlaylistCoverUrl(playlist.id)}
                  alt={playlist.name}
                  className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                <div className="ml-3 flex-1 min-w-0">
                  <h3 className="text-white text-sm font-medium truncate">
                    {playlist.name}
                  </h3>
                  <p className="text-gray-400 text-xs truncate">
                    {playlist.user?.name || 'Unknown'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
