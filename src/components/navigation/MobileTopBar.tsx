import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Disc, ListMusic } from 'lucide-react';

const MobileTopBar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'albums' | 'playlists'>('albums');
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

  const handleTabChange = (tab: 'albums' | 'playlists') => {
    setActiveTab(tab);
    // Navigate to the respective main page
    if (tab === 'albums') {
      navigate('/');
    } else {
      navigate('/playlists');
    }
  };

  return (
    <div className="mobile-show desktop-hide bg-gray-900 border-b border-gray-800 px-4 py-1">
      <div className="flex bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => handleTabChange('albums')}
          className={`flex items-center justify-center flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'albums'
              ? 'bg-theme-color text-white shadow-sm'
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
              ? 'bg-theme-color text-white shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <ListMusic className="w-4 h-4 mr-2" />
          Playlists
        </button>
      </div>
    </div>
  );
};

export default MobileTopBar; 