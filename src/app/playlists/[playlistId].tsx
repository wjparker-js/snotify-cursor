import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AlbumHeader } from '@/components/albums/AlbumHeader';
import { TrackList } from '@/components/albums/TrackList';
import { Sidebar } from '@/components/shared/Sidebar';

// Mock data for demonstration
const playlists = [
  {
    id: 'p1',
    cover: '/covers/roadhouse.jpg',
    title: 'Chill Vibes',
    owner: 'Bill Parker',
    stats: { followers: 120, plays: 340 },
    tracks: [
      { id: 't1', number: 1, title: 'Opening Night', artist: 'Bill Parker', duration: '3:45' },
      { id: 't2', number: 2, title: 'Bar Blues', artist: 'Bill Parker', duration: '4:12' },
      { id: 't3', number: 3, title: 'Encore', artist: 'Bill Parker', duration: '5:01' },
    ],
  },
  {
    id: 'p2',
    cover: '/covers/viking.jpg',
    title: 'Workout Mix',
    owner: 'Gerry Hodgett',
    stats: { followers: 98, plays: 222 },
    tracks: [
      { id: 't4', number: 1, title: 'A New Dawn', artist: 'Gerry Hodgett', duration: '2:58' },
      { id: 't5', number: 2, title: 'The Ship', artist: 'Gerry Hodgett', duration: '3:21' },
      { id: 't6', number: 3, title: 'Stormy Seas', artist: 'Gerry Hodgett', duration: '4:05' },
      { id: 't7', number: 4, title: 'The Storm', artist: 'Gerry Hodgett', duration: '3:44' },
      { id: 't8', number: 5, title: 'Sea Sirens', artist: 'Gerry Hodgett', duration: '5:10' },
    ],
  },
  {
    id: 'p3',
    cover: '/covers/home.jpg',
    title: 'Focus Playlist',
    owner: 'Gerry Hodgett',
    stats: { followers: 77, plays: 115 },
    tracks: [
      { id: 't9', number: 1, title: 'Clouds', artist: 'Gerry Hodgett', duration: '3:12' },
      { id: 't10', number: 2, title: 'Sunrise', artist: 'Gerry Hodgett', duration: '4:00' },
    ],
  },
];

export default function PlaylistDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const playlistId = params?.playlistId as string;
  const playlist = playlists.find((p) => p.id === playlistId) || playlists[0];

  // Demo handlers for sidebar
  const handleSidebarItemSelect = (item: any) => {
    if (item.type === 'Playlist') {
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
        activeItemId={playlist.id as string}
        onItemSelect={handleSidebarItemSelect}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        <AlbumHeader
          cover={playlist.cover}
          title={playlist.title}
          artist={playlist.owner}
          stats={{ plays: playlist.stats.plays, likes: playlist.stats.followers }}
        />
        <h2 className="text-xl font-semibold mb-4 text-text">Tracks</h2>
        <TrackList tracks={playlist.tracks} isAdmin={true} />
      </main>
    </div>
  );
} 