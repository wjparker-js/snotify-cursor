import React from 'react';

const sections = [
  {
    title: 'Recently Played',
    items: [
      { title: 'Chill Hits', subtitle: 'Playlist', image: 'https://placehold.co/160x160', href: '#' },
      { title: 'Top 50 Global', subtitle: 'Playlist', image: 'https://placehold.co/160x160', href: '#' },
      { title: 'Rock Classics', subtitle: 'Playlist', image: 'https://placehold.co/160x160', href: '#' },
      { title: 'Pop Rising', subtitle: 'Playlist', image: 'https://placehold.co/160x160', href: '#' },
    ],
  },
  {
    title: 'Made for You',
    items: [
      { title: 'Discover Weekly', subtitle: 'Playlist', image: 'https://placehold.co/160x160', href: '#' },
      { title: 'Release Radar', subtitle: 'Playlist', image: 'https://placehold.co/160x160', href: '#' },
      { title: 'Daily Mix 1', subtitle: 'Playlist', image: 'https://placehold.co/160x160', href: '#' },
      { title: 'Daily Mix 2', subtitle: 'Playlist', image: 'https://placehold.co/160x160', href: '#' },
    ],
  },
  {
    title: 'New Releases',
    items: [
      { title: 'New Album 1', subtitle: 'Artist Name', image: 'https://placehold.co/160x160', href: '#' },
      { title: 'New Album 2', subtitle: 'Artist Name', image: 'https://placehold.co/160x160', href: '#' },
      { title: 'New Album 3', subtitle: 'Artist Name', image: 'https://placehold.co/160x160', href: '#' },
      { title: 'New Album 4', subtitle: 'Artist Name', image: 'https://placehold.co/160x160', href: '#' },
    ],
  },
];

function Section({ title, items }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
      <div className="flex gap-6 overflow-x-auto pb-2 hide-scrollbar">
        {items.map((item) => (
          <a
            key={item.title}
            href={item.href}
            className="bg-spotify-gray rounded-lg p-4 w-40 flex-shrink-0 hover:bg-spotify-green/10 transition-colors group"
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
  );
}

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto">
      {sections.map((section) => (
        <Section key={section.title} title={section.title} items={section.items} />
      ))}
    </div>
  );
}

// Hide scrollbar utility
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`;
  document.head.appendChild(style);
} 