import React from 'react';

const artist = {
  name: 'Artist Name',
  image: 'https://placehold.co/240x240',
  followers: 123456,
  topTracks: [
    { title: 'Hit Song 1', duration: '3:45' },
    { title: 'Hit Song 2', duration: '4:12' },
    { title: 'Hit Song 3', duration: '2:58' },
    { title: 'Hit Song 4', duration: '3:21' },
  ],
  albums: [
    { title: 'Greatest Hits', year: 2024, image: 'https://placehold.co/120x120', href: '#' },
    { title: 'Live in Concert', year: 2022, image: 'https://placehold.co/120x120', href: '#' },
  ],
};

export default function ArtistDetailPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-8 mb-10">
        <img src={artist.image} alt={artist.name} className="w-60 h-60 rounded-full shadow-lg" />
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{artist.name}</h1>
          <p className="text-spotify-gray-light mb-4">{artist.followers.toLocaleString()} followers</p>
          <button className="bg-spotify-green text-black font-bold px-8 py-3 rounded-full hover:bg-spotify-green/80 transition-colors text-lg">Follow</button>
        </div>
      </div>
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-white mb-4">Top Tracks</h2>
        <div className="bg-spotify-gray rounded-lg p-6">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="text-spotify-gray-light pb-2 font-normal">#</th>
                <th className="text-spotify-gray-light pb-2 font-normal">Title</th>
                <th className="text-spotify-gray-light pb-2 font-normal">Duration</th>
              </tr>
            </thead>
            <tbody>
              {artist.topTracks.map((track, idx) => (
                <tr key={track.title} className="border-t border-spotify-dark hover:bg-spotify-dark/60 transition-colors">
                  <td className="py-2 text-spotify-gray-light w-8">{idx + 1}</td>
                  <td className="py-2 text-white font-medium">{track.title}</td>
                  <td className="py-2 text-spotify-gray-light">{track.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-white mb-4">Albums</h2>
        <div className="flex gap-6 flex-wrap">
          {artist.albums.map((album) => (
            <a
              key={album.title}
              href={album.href}
              className="bg-spotify-gray rounded-lg p-4 w-32 hover:bg-spotify-green/10 transition-colors group mb-4"
            >
              <img
                src={album.image}
                alt={album.title}
                className="w-24 h-24 rounded-lg mb-3 shadow-lg group-hover:scale-105 transition-transform"
              />
              <div className="font-semibold text-white truncate">{album.title}</div>
              <div className="text-sm text-spotify-gray-light truncate">{album.year}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
} 