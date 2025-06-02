import React from 'react';

const playlist = {
  title: 'Chill Hits',
  description: 'Kick back to the best chill tracks.',
  image: 'https://placehold.co/240x240',
  owner: 'Test User',
  tracks: [
    { title: 'Track One', artist: 'Artist A', duration: '3:45' },
    { title: 'Track Two', artist: 'Artist B', duration: '4:12' },
    { title: 'Track Three', artist: 'Artist C', duration: '2:58' },
    { title: 'Track Four', artist: 'Artist D', duration: '3:21' },
  ],
};

export default function PlaylistDetailPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-8 mb-10">
        <img src={playlist.image} alt={playlist.title} className="w-60 h-60 rounded-lg shadow-lg" />
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{playlist.title}</h1>
          <p className="text-spotify-gray-light mb-2">By {playlist.owner}</p>
          <p className="text-white text-base mb-4">{playlist.description}</p>
          <button className="bg-spotify-green text-black font-bold px-8 py-3 rounded-full hover:bg-spotify-green/80 transition-colors text-lg">Play</button>
        </div>
      </div>
      <div className="bg-spotify-gray rounded-lg p-6">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="text-spotify-gray-light pb-2 font-normal">#</th>
              <th className="text-spotify-gray-light pb-2 font-normal">Title</th>
              <th className="text-spotify-gray-light pb-2 font-normal">Artist</th>
              <th className="text-spotify-gray-light pb-2 font-normal">Duration</th>
            </tr>
          </thead>
          <tbody>
            {playlist.tracks.map((track, idx) => (
              <tr key={track.title} className="border-t border-spotify-dark hover:bg-spotify-dark/60 transition-colors">
                <td className="py-2 text-spotify-gray-light w-8">{idx + 1}</td>
                <td className="py-2 text-white font-medium">{track.title}</td>
                <td className="py-2 text-spotify-gray-light">{track.artist}</td>
                <td className="py-2 text-spotify-gray-light">{track.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 