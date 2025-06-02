import React from 'react';
import Sidebar from '@/components/spotify/Sidebar';
import MediaPlayer from '@/components/player/MediaPlayer';
import { MediaPlayerProvider } from '@/contexts/MediaPlayerContext';
import '@/styles/spotify-theme.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <MediaPlayerProvider>
      <div className="bg-spotify-black min-h-screen flex flex-col">
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <main className="flex-1 overflow-y-auto p-6 bg-spotify-dark text-white">
              {children}
            </main>
          </div>
        </div>
        <MediaPlayer />
      </div>
    </MediaPlayerProvider>
  );
} 