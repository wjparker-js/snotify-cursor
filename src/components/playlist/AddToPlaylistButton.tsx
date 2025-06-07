import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListPlus, Plus } from 'lucide-react';
import AddPlaylistDialog from './AddPlaylistDialog';

interface Playlist {
  id: number;
  name: string;
  user?: { name: string };
}

interface AddToPlaylistButtonProps {
  trackId: string | number;
  trackTitle?: string;
  children?: React.ReactNode;
  variant?: 'button' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

const AddToPlaylistButton: React.FC<AddToPlaylistButtonProps> = ({ 
  trackId, 
  trackTitle = 'track',
  children, 
  variant = 'icon',
  size = 'sm'
}) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { toast } = useToast();

  // Fetch user playlists when dropdown opens
  const fetchPlaylists = async () => {
    if (playlists.length > 0) return; // Already loaded
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/playlists');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch playlists');
      }
      const data = await response.json();
      setPlaylists(data);
    } catch (error: any) {
      console.error('Error fetching playlists:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load playlists",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add song to selected playlist
  const addToPlaylist = async (playlistId: number, playlistName: string) => {
    setIsAddingToPlaylist(true);
    try {
      const response = await fetch(`http://localhost:4000/api/playlists/${playlistId}/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songId: Number(trackId),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          // Song already in playlist
          toast({
            title: "Already in playlist",
            description: `"${trackTitle}" is already in "${playlistName}"`,
            variant: "default",
          });
          return;
        }
        throw new Error(errorData.error || 'Failed to add song to playlist');
      }

      toast({
        title: "Added to playlist",
        description: `"${trackTitle}" was added to "${playlistName}"`,
        variant: "default",
      });
      
      setDropdownOpen(false);
    } catch (error: any) {
      console.error('Error adding to playlist:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add song to playlist",
        variant: "destructive",
      });
    } finally {
      setIsAddingToPlaylist(false);
    }
  };

  // Handle playlist refresh after creating new playlist
  const handlePlaylistAdded = () => {
    setPlaylists([]); // Clear cache to force refresh
    fetchPlaylists(); // Reload playlists
  };

  // Open dropdown and fetch playlists
  const handleDropdownOpen = (open: boolean) => {
    setDropdownOpen(open);
    if (open) {
      fetchPlaylists();
    }
  };

  const triggerButton = children || (
    variant === 'button' ? (
      <Button variant="outline" size={size} className="gap-2">
        <ListPlus size={16} />
        Add to Playlist
      </Button>
    ) : (
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <ListPlus size={16} />
      </Button>
    )
  );

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={handleDropdownOpen}>
      <DropdownMenuTrigger asChild>
        {triggerButton}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Add to Playlist</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Create New Playlist Option */}
        <AddPlaylistDialog onPlaylistAdded={handlePlaylistAdded}>
          <DropdownMenuItem 
            onSelect={(e) => e.preventDefault()} 
            className="cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Playlist
          </DropdownMenuItem>
        </AddPlaylistDialog>
        
        {/* Loading State */}
        {isLoading && (
          <DropdownMenuItem disabled>
            Loading playlists...
          </DropdownMenuItem>
        )}
        
        {/* No Playlists State */}
        {!isLoading && playlists.length === 0 && (
          <DropdownMenuItem disabled>
            No playlists found
          </DropdownMenuItem>
        )}
        
        {/* Playlist List */}
        {!isLoading && playlists.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {playlists.map((playlist) => (
              <DropdownMenuItem
                key={playlist.id}
                onClick={() => addToPlaylist(playlist.id, playlist.name)}
                disabled={isAddingToPlaylist}
                className="cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{playlist.name}</span>
                  {playlist.user?.name && (
                    <span className="text-xs text-muted-foreground">
                      by {playlist.user.name}
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddToPlaylistButton;