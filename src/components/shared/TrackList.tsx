import React from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';

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
}

const TrackList: React.FC<TrackListProps> = ({ tracks, onPlayTrack }) => {
  const { currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack } = useMediaPlayer();
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrackList;