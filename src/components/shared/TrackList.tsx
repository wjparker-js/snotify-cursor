import React, { useState, useEffect } from 'react';
import { Play, Pause, Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';
import { useAuth } from '@/context/AuthContext';
import AddToPlaylistButton from '@/components/playlist/AddToPlaylistButton';

// TODO: Implement track list functionality using MySQL/Prisma and local file storage. Supabase logic removed.

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  track_number: number;
  audioUrl?: string;
  album?: string;
  albumArt?: string;
}

interface TrackListProps {
  tracks: Track[];
  onPlayTrack?: (track: Track) => void;
  isAdmin: boolean;
}

const TrackList: React.FC<TrackListProps> = ({ tracks, onPlayTrack, isAdmin }) => {
  const { currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack } = useMediaPlayer();
  const { user } = useAuth();

  // Placeholder: Replace with real liked tracks logic
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set());
  const handleToggleLike = (trackId: string) => {
    setLikedTrackIds(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId); else next.add(trackId);
      return next;
    });
  };

  const handleDeleteTrack = async (track: Track) => {
    if (!confirm(`Are you sure you want to delete "${track.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/songs/${track.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete track');
      }

      // Refresh the page or notify parent component to update the track list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting track:', error);
      alert('Failed to delete track. Please try again.');
    }
  };

  if (!tracks || tracks.length === 0) {
    return (
      <div className="w-full py-8 text-center text-muted-foreground">
        No tracks found for this album.
      </div>
    );
  }

  const handlePlayPause = (track: Track) => {
    try {
      if (!track.audioUrl) return;
      if (currentTrack?.id === track.id) {
        if (isPlaying) {
          pauseTrack();
        } else {
          resumeTrack();
        }
      } else {
        playTrack(track, tracks, 'album');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error handling play/pause:', error);
    }
  };

  return (
    <div className="w-full mt-6">
      <table className="min-w-full divide-y divide-zinc-700">
        <thead>
          <tr>
            <th className="px-2 py-0.5 text-left text-xs font-medium text-muted-foreground">#</th>
            <th className="px-2 py-0.5 text-left text-xs font-medium text-muted-foreground">Title</th>
            <th className="px-2 py-0.5 text-left text-xs font-medium text-muted-foreground">Artist</th>
            <th className="px-2 py-0.5 text-left text-xs font-medium text-muted-foreground">Duration</th>
            <th className="px-2 py-0.5 text-center text-xs font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {tracks.map((track, index) => (
            <tr key={track.id} className="hover:bg-zinc-900 transition-colors">
              <td className="px-2 py-0.5 text-xs text-zinc-300 w-8 text-center flex items-center justify-center gap-1">
                {track.track_number || index + 1}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePlayPause(track)}
                  aria-label={currentTrack?.id === track.id && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
                  disabled={!track.audioUrl}
                  data-testid={`play-pause-btn-${track.id}`}
                >
                  {currentTrack?.id === track.id && isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </td>
              <td className="px-2 py-0.5 text-xs font-medium text-white truncate max-w-xs">{track.title}</td>
              <td className="px-2 py-0.5 text-xs text-zinc-400 truncate max-w-xs">{track.artist}</td>
              <td className="px-2 py-0.5 text-xs text-zinc-400 text-center">{track.duration || '-'}</td>
              <td className="px-2 py-0.5 text-xs text-center flex items-center gap-2 justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Like track" onClick={() => handleToggleLike(track.id)}>
                      <Heart className={`w-4 h-4 ${likedTrackIds.has(track.id) ? 'text-green-500 fill-green-500' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Like</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AddToPlaylistButton 
                      trackId={track.id} 
                      trackTitle={track.title}
                      variant="icon" 
                    />
                  </TooltipTrigger>
                  <TooltipContent>Add to Playlist</TooltipContent>
                </Tooltip>
                {isAdmin && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Delete track" onClick={() => handleDeleteTrack(track)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
};

export default TrackList;