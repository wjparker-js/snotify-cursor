import React from 'react';

interface AlbumSidebarProps {
  recentAlbums: {
    id: string | number;
    cover: string;
    title: string;
    artist: string;
  }[];
  activeAlbumId?: string | number;
  onAlbumSelect?: (id: string | number) => void;
}

export const AlbumSidebar: React.FC<AlbumSidebarProps> = ({ recentAlbums, activeAlbumId, onAlbumSelect }) => (
  <aside className="w-64 bg-card border-r border-bg-secondary p-4 flex flex-col">
    <h2 className="text-lg font-bold mb-4 text-text">Recent Albums</h2>
    <div className="space-y-2">
      {recentAlbums.map((album) => (
        <button
          key={album.id}
          className={`flex items-center w-full p-2 rounded-lg transition group ${activeAlbumId === album.id ? 'bg-highlight text-bg' : 'hover:bg-bg-secondary'}`}
          onClick={() => onAlbumSelect?.(album.id)}
        >
          <img
            src={album.cover}
            alt={album.title}
            className="w-10 h-10 rounded-md object-cover mr-3"
          />
          <div className="flex-1 text-left">
            <div className="font-medium truncate">{album.title}</div>
            <div className="text-xs text-muted truncate">{album.artist}</div>
          </div>
        </button>
      ))}
    </div>
    <div className="mt-8">
      <h3 className="text-sm font-semibold text-muted mb-2">Quick Links</h3>
      <div className="flex flex-col space-y-1">
        <a href="/albums" className="text-highlight hover:underline">All Albums</a>
        <a href="/playlists" className="text-highlight hover:underline">Playlists</a>
        <a href="/blogs" className="text-highlight hover:underline">Blogs</a>
      </div>
    </div>
  </aside>
); 