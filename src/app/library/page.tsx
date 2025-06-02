import React from 'react';

const playlists = [
  { title: 'Chill Hits', subtitle: 'Playlist', image: 'https://placehold.co/160x160', href: '#' },
  { title: 'Top 50 Global', subtitle: 'Playlist', image: 'https://placehold.co/160x160', href: '#' },
  { title: 'Rock Classics', subtitle: 'Playlist', image: 'https://placehold.co/160x160', href: '#' },
  { title: 'Pop Rising', subtitle: 'Playlist', image: 'https://placehold.co/160x160', href: '#' },
];

const likedSongs = [
  { title: 'Liked Songs', subtitle: 'Collection', image: 'https://placehold.co/160x160?text=♥', href: '#' },
];

export default function LibraryPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Your Library</h1>
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">Playlists</h2>
        <div className="flex gap-6 flex-wrap">
          {playlists.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="bg-spotify-gray rounded-lg p-4 w-40 hover:bg-spotify-green/10 transition-colors group mb-4"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-32 h-32 rounded-lg mb-3 shadow-lg group-hover:scale-105 transition-transform"
              />
              <div className="font-semibold text-white truncate">{item.title}</div>
              <div className="text-sm text-spotify-gray-light truncate">{item.subtitle}</div>
            </a>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Liked Songs</h2>
        <div className="flex gap-6 flex-wrap">
          {likedSongs.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="bg-spotify-green/20 rounded-lg p-4 w-40 hover:bg-spotify-green/40 transition-colors group mb-4"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-32 h-32 rounded-lg mb-3 shadow-lg group-hover:scale-105 transition-transform"
              />
              <div className="font-semibold text-white truncate">{item.title}</div>
              <div className="text-sm text-spotify-gray-light truncate">{item.subtitle}</div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
} 