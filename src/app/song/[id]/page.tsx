import React from 'react';
import { Play, Heart } from 'lucide-react';

const song = {
  title: 'Hit Song 1',
  artist: 'Artist Name',
  album: 'Greatest Hits',
  albumArt: 'https://placehold.co/240x240',
  duration: '3:45',
};

export default function SongDetailPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-8 mb-10">
        <img src={song.albumArt} alt={song.title} className="w-60 h-60 rounded-lg shadow-lg" />
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{song.title}</h1>
          <p className="text-spotify-gray-light mb-1">{song.artist}</p>
          <p className="text-spotify-gray-light mb-4">Album: {song.album}</p>
          <div className="flex items-center gap-4">
            <button className="bg-spotify-green text-black font-bold px-8 py-3 rounded-full hover:bg-spotify-green/80 transition-colors text-lg flex items-center gap-2">
              <Play className="w-6 h-6" /> Play
            </button>
            <button className="text-spotify-green hover:text-white transition-colors">
              <Heart className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>
      <div className="bg-spotify-gray rounded-lg p-6 flex items-center justify-between">
        <span className="text-white font-semibold">Duration</span>
        <span className="text-spotify-gray-light">{song.duration}</span>
      </div>
    </div>
  );
} 