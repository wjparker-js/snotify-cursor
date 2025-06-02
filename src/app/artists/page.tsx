import React, { useState } from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { ArtistGrid } from '@/components/artists/ArtistGrid';
import { useRouter } from 'next/navigation';

// Mock data for demonstration
const artists = [
  {
    id: 'a1',
    cover: '/covers/roadhouse.jpg',
    name: 'Bill Parker',
  },
  {
    id: 'a2',
    cover: '/covers/viking.jpg',
    name: 'Gerry Hodgett',
  },
  {
    id: 'a3',
    cover: '/covers/home.jpg',
    name: 'Tom Bukovac',
  },
  // Add more artists as needed
];

export default function ArtistsPage() {
  const [activeArtistId, setActiveArtistId] = useState<string | number | undefined>(undefined);
  const router = useRouter();

  const handleArtistClick = (artist: typeof artists[0]) => {
    setActiveArtistId(artist.id);
    router.push(`/artists/${artist.id}`); // Navigate to artist details
  };

  // Demo handlers for sidebar
  const handleSidebarItemSelect = (item: any) => {
    if (item.type === 'Artist') {
      setActiveArtistId(item.id);
      router.push(`/artists/${item.id}`);
    } else if (item.type === 'Album') {
      alert(`Navigate to album: ${item.title}`);
    } else if (item.type === 'Playlist') {
      alert(`Navigate to playlist: ${item.title}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar
        activeTab="artists"
        activeItemId={activeArtistId as string}
        onItemSelect={handleSidebarItemSelect}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-8 text-text">Artists</h1>
        <ArtistGrid artists={artists} onArtistClick={handleArtistClick} />
      </main>
    </div>
  );
} 