import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart } from 'lucide-react';

export default function NowPlayingBar() {
  // Placeholder data
  const track = {
    title: 'Song Title',
    artist: 'Artist Name',
    albumArt: 'https://placehold.co/56x56',
    isPlaying: false,
  };

  return (
    <div className="sticky bottom-0 left-0 w-full bg-spotify-black border-t border-spotify-gray h-20 flex items-center px-6 z-50">
      <div className="flex items-center gap-4 w-1/3 min-w-0">
        <img src={track.albumArt} alt="Album Art" className="w-14 h-14 rounded-md shadow" />
        <div className="min-w-0">
          <div className="font-semibold truncate text-white">{track.title}</div>
          <div className="text-sm text-spotify-gray-light truncate">{track.artist}</div>
        </div>
        <button className="ml-2 text-spotify-green hover:text-white transition-colors">
          <Heart className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center">
        <div className="flex items-center gap-6">
          <button className="text-white hover:text-spotify-green transition-colors">
            <SkipBack className="w-6 h-6" />
          </button>
          <button className="bg-white text-spotify-black rounded-full p-2 shadow-lg hover:bg-spotify-green hover:text-white transition-colors">
            {track.isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
          </button>
          <button className="text-white hover:text-spotify-green transition-colors">
            <SkipForward className="w-6 h-6" />
          </button>
        </div>
        <div className="w-full flex items-center gap-2 mt-2">
          <span className="text-xs text-spotify-gray-light">0:00</span>
          <div className="flex-1 h-1 bg-spotify-gray rounded-full overflow-hidden">
            <div className="h-full bg-spotify-green" style={{ width: '30%' }} />
          </div>
          <span className="text-xs text-spotify-gray-light">3:45</span>
        </div>
      </div>
      <div className="w-1/3 flex justify-end items-center gap-4">
        {/* Future: volume, queue, device controls */}
      </div>
    </div>
  );
} 