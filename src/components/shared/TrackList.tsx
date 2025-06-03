import React, { useState, useEffect } from 'react';
import { Play, Pause, Heart, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';
import { useAuth } from '@/context/AuthContext';

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
  const [playlistModalTrack, setPlaylistModalTrack] = useState<Track | null>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');

  // Fetch user playlists
  useEffect(() => {
    if (!user) return;
    setPlaylistsLoading(true);
    fetch('/api/playlists')
      .then(res => res.json())
      .then(data => {
        setPlaylists(Array.isArray(data) ? data.filter((pl) => pl.userId === user.id) : []);
      })
      .catch(() => setPlaylists([]))
      .finally(() => setPlaylistsLoading(false));
  }, [user]);

  // Placeholder: Replace with real liked tracks logic
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set());
  const handleToggleLike = (trackId: string) => {
    setLikedTrackIds(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId); else next.add(trackId);
      return next;
    });
  };

  const handleAddToPlaylist = (track: Track) => {
    setPlaylistModalTrack(track);
    setSelectedPlaylistId('');
  };

  const handleDeleteTrack = (track: Track) => {
    // Placeholder: Implement admin delete logic
    // eslint-disable-next-line no-console
    console.log('Delete track', track.id);
  };

  const handleAddTrackToPlaylist = () => {
    // Placeholder: Implement add to playlist logic
    // eslint-disable-next-line no-console
    console.log('Add track', playlistModalTrack?.id, 'to playlist', selectedPlaylistId);
    setPlaylistModalTrack(null);
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
            <th className="px-2 py-1 text-left text-xs font-medium text-muted-foreground">#</th>
            <th className="px-2 py-1 text-left text-xs font-medium text-muted-foreground">Title</th>
            <th className="px-2 py-1 text-left text-xs font-medium text-muted-foreground">Artist</th>
            <th className="px-2 py-1 text-left text-xs font-medium text-muted-foreground">Duration</th>
            <th className="px-2 py-1 text-center text-xs font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {tracks.map((track, index) => (
            <tr key={track.id} className="hover:bg-zinc-900 transition-colors">
              <td className="px-2 py-1 text-xs text-zinc-300 w-8 text-center flex items-center justify-center gap-1">
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
              <td className="px-2 py-1 text-xs font-medium text-white truncate max-w-xs">{track.title}</td>
              <td className="px-2 py-1 text-xs text-zinc-400 truncate max-w-xs">{track.artist}</td>
              <td className="px-2 py-1 text-xs text-zinc-400 text-center">{track.duration || '-'}</td>
              <td className="px-2 py-1 text-xs text-center flex items-center gap-2 justify-center">
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
                    <Button variant="ghost" size="icon" aria-label="Add to playlist" onClick={() => handleAddToPlaylist(track)}>
                      <Plus className="w-4 h-4" />
                    </Button>
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
      {/* Playlist modal */}
      {playlistModalTrack && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-4 rounded shadow-lg w-80">
            <div className="mb-2 text-sm font-semibold">Add to Playlist</div>
            {playlistsLoading ? (
              <div className="text-xs text-muted-foreground mb-4">Loading playlists...</div>
            ) : (
              <select
                className="w-full mb-4 p-2 rounded bg-zinc-800 text-white"
                value={selectedPlaylistId}
                onChange={e => setSelectedPlaylistId(e.target.value)}
              >
                <option value="">Select a playlist</option>
                {playlists.map((pl) => (
                  <option key={pl.id} value={pl.id}>{pl.name}</option>
                ))}
              </select>
            )}
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => setPlaylistModalTrack(null)}>Cancel</Button>
              <Button size="sm" variant="default" disabled={!selectedPlaylistId} onClick={handleAddTrackToPlaylist}>Add</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackList;