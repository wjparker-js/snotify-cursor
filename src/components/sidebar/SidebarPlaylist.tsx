
import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export interface Playlist {
  id: string;
  title: string;
  owner: string;
  image_url: string | null;
  description: string | null;
  created_at: string;
}

interface SidebarPlaylistProps {
  playlists: Playlist[];
}

const SidebarPlaylist: React.FC<SidebarPlaylistProps> = ({ playlists }) => {
  // Add console log to debug
  console.log("Sidebar Playlists to render:", playlists);
  
  if (!playlists || playlists.length === 0) {
    return (
      <div className="text-xs text-zinc-500 italic px-2 py-1">
        No playlists found
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      {playlists.map((playlist) => {
        // Clean image URL if it's a blob URL or invalid
        const imageUrl = playlist.image_url && (playlist.image_url.startsWith('blob:') || !playlist.image_url.startsWith('http')) 
          ? '/placeholder.svg'  // Use placeholder if it's a blob URL or doesn't start with http
          : playlist.image_url || '/placeholder.svg';  // Fallback to placeholder if null
        
        return (
          <Link to={`/playlist/${playlist.id}`} key={playlist.id} className="block">
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-900 cursor-pointer group">
              <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden flex items-center justify-center bg-zinc-700">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={playlist.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log("Error loading image:", imageUrl);
                      e.currentTarget.src = '/placeholder.svg';
                    }} 
                  />
                ) : (
                  <span className="text-sm font-medium text-white">{playlist.title[0]}</span>
                )}
              </div>
              
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-white truncate group-hover:text-theme-color transition-colors">
                  {playlist.title}
                </span>
                <div className="flex items-center text-xs text-spotify-text-secondary">
                  <span className="truncate">
                    Playlist • {playlist.owner}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default SidebarPlaylist;
