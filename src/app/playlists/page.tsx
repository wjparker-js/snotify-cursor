import React, { useState } from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { PlaylistGrid } from '@/components/playlists/PlaylistGrid';
import { useRouter } from 'next/navigation';

// Mock data for demonstration
const playlists = [
  {
    id: 'p1',
    cover: '/covers/roadhouse.jpg',
    title: 'Chill Vibes',
    owner: 'Bill Parker',
  },
  {
    id: 'p2',
    cover: '/covers/viking.jpg',
    title: 'Workout Mix',
    owner: 'Gerry Hodgett',
  },
  {
    id: 'p3',
    cover: '/covers/home.jpg',
    title: 'Focus Playlist',
    owner: 'Gerry Hodgett',
  },
  // Add more playlists as needed
];

export default function PlaylistsPage() {
  const [activePlaylistId, setActivePlaylistId] = useState<string | number | undefined>(undefined);
  const router = useRouter();

  const handlePlaylistClick = (playlist: typeof playlists[0]) => {
    setActivePlaylistId(playlist.id);
    router.push(`/playlists/${playlist.id}`); // Navigate to playlist details
  };

  // Demo handlers for sidebar
  const handleSidebarItemSelect = (item: any) => {
    if (item.type === 'Playlist') {
      setActivePlaylistId(item.id);
      router.push(`/playlists/${item.id}`);
    } else if (item.type === 'Album') {
      alert(`Navigate to album: ${item.title}`);
    } else if (item.type === 'Artist') {
      alert(`Navigate to artist: ${item.title}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar
        activeTab="playlists"
        activeItemId={activePlaylistId as string}
        onItemSelect={handleSidebarItemSelect}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-8 text-text">Available Playlists</h1>
        <PlaylistGrid playlists={playlists} onPlaylistClick={handlePlaylistClick} />
      </main>
    </div>
  );
} 