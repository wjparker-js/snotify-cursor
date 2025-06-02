import React, { useState } from 'react';
import { Plus, MoreHorizontal, Disc, ListMusic, User } from 'lucide-react';

const mockAlbums = [
  { id: '1', cover: '/covers/roadhouse.jpg', title: 'Roadhouse Live', type: 'Album' },
  { id: '2', cover: '/covers/viking.jpg', title: 'Viking Symphony', type: 'Album' },
  { id: '3', cover: '/covers/home.jpg', title: 'Home', type: 'Album' },
];
const mockPlaylists = [
  { id: 'p1', cover: '/covers/roadhouse.jpg', title: 'Chill Vibes', type: 'Playlist' },
  { id: 'p2', cover: '/covers/viking.jpg', title: 'Workout Mix', type: 'Playlist' },
];
const mockArtists = [
  { id: 'a1', cover: '/covers/roadhouse.jpg', title: 'Bill Parker', type: 'Artist' },
  { id: 'a2', cover: '/covers/viking.jpg', title: 'Gerry Hodgett', type: 'Artist' },
];

const tabs = [
  { key: 'albums', label: 'Albums', icon: Disc },
  { key: 'playlists', label: 'Playlists', icon: ListMusic },
  { key: 'artists', label: 'Artists', icon: User },
];

export const Sidebar: React.FC<{
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onItemSelect?: (item: any) => void;
  activeItemId?: string;
}> = ({ activeTab: initialTab = 'albums', onTabChange, onItemSelect, activeItemId }) => {
  const [tab, setTab] = useState(initialTab);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const items =
    tab === 'albums' ? mockAlbums : tab === 'playlists' ? mockPlaylists : mockArtists;

  const handleTabChange = (key: string) => {
    setTab(key);
    onTabChange?.(key);
  };

  return (
    <aside className="w-64 bg-card border-r border-bg-secondary p-4 flex flex-col h-screen">
      {/* Tabs */}
      <div className="flex items-center mb-6 space-x-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`flex items-center px-3 py-2 rounded-lg font-semibold transition text-sm space-x-2 ${
              tab === key ? 'bg-highlight text-bg' : 'hover:bg-bg-secondary text-text'
            }`}
            onClick={() => handleTabChange(key)}
            aria-label={label}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
        <button className="ml-auto p-2 rounded hover:bg-bg-secondary" aria-label="Add new">
          <Plus className="w-5 h-5 text-highlight" />
        </button>
      </div>
      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center w-full p-2 rounded-lg transition group cursor-pointer ${
              activeItemId === item.id ? 'bg-highlight text-bg' : 'hover:bg-bg-secondary'
            }`}
            onClick={() => onItemSelect?.(item)}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            tabIndex={0}
            role="button"
            aria-label={`View ${item.type} ${item.title}`}
          >
            <img
              src={item.cover}
              alt={item.title}
              className="w-9 h-9 rounded-md object-cover mr-3"
            />
            <div className="flex-1 text-left">
              <div className="font-medium truncate">{item.title}</div>
              <div className="text-xs text-muted truncate">{item.type}</div>
            </div>
            {/* Quick actions (appear on hover/focus) */}
            <div className={`flex items-center space-x-1 ml-2 transition-opacity duration-150 ${hoveredId === item.id ? 'opacity-100' : 'opacity-0'}`}>
              <button className="hover:text-highlight focus:outline-none" tabIndex={-1} aria-label="More options">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}; 