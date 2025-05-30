import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

// TODO: Implement track list functionality using MySQL/Prisma and local file storage. Supabase logic removed.

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  track_number: number;
  audio_path?: string | null;
}

interface TrackListProps {
  tracks: Track[];
  onPlayTrack?: (track: Track) => void;
}

const TrackList: React.FC<TrackListProps> = ({ tracks, onPlayTrack }) => {
  if (!tracks || tracks.length === 0) {
    return (
      <div className="w-full py-8 text-center text-muted-foreground">
        No tracks found for this album.
      </div>
    );
  }

  return (
    <div className="w-full mt-6">
      <table className="min-w-full divide-y divide-zinc-700">
        <thead>
          <tr>
            <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">#</th>
            <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">Title</th>
            <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">Artist</th>
            <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">Duration</th>
            <th className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">Play</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {tracks.map((track, index) => (
            <tr key={track.id} className="hover:bg-zinc-900 transition-colors">
              <td className="px-2 py-2 text-sm text-zinc-300 w-8 text-center">{track.track_number || index + 1}</td>
              <td className="px-2 py-2 text-sm font-medium text-white truncate max-w-xs">{track.title}</td>
              <td className="px-2 py-2 text-sm text-zinc-400 truncate max-w-xs">{track.artist}</td>
              <td className="px-2 py-2 text-sm text-zinc-400 text-center">{track.duration || '-'}</td>
              <td className="px-2 py-2 text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onPlayTrack && onPlayTrack(track)}
                  aria-label={`Play ${track.title}`}
                  disabled={!track.audio_path}
                >
                  <Play className="w-5 h-5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrackList;