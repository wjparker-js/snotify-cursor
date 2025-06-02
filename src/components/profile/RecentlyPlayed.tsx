import Image from 'next/image';
import { Play, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  playedAt: string;
  audioUrl: string;
}

interface RecentlyPlayedProps {
  tracks: Track[];
}

export default function RecentlyPlayed({ tracks }: RecentlyPlayedProps) {
  const { currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack } = useMediaPlayer();

  const handlePlayPause = (track: Track) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        pauseTrack();
      } else {
        resumeTrack();
      }
    } else {
      playTrack(track);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Recently Played</h3>
      <div className="space-y-4">
        {tracks.map((track) => (
          <div
            key={track.id}
            className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
              currentTrack?.id === track.id
                ? 'bg-blue-500/10 border border-blue-500/20'
                : 'hover:bg-gray-700/50'
            }`}
          >
            <button
              onClick={() => handlePlayPause(track)}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors"
            >
              {currentTrack?.id === track.id && isPlaying ? (
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-1 h-3 bg-white mx-0.5 animate-pulse" />
                  <div className="w-1 h-3 bg-white mx-0.5 animate-pulse delay-75" />
                  <div className="w-1 h-3 bg-white mx-0.5 animate-pulse delay-150" />
                </div>
              ) : (
                <Play className="w-4 h-4 text-white" />
              )}
            </button>
            <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={track.albumArt}
                alt={track.album}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium truncate">{track.title}</h4>
              <p className="text-gray-400 text-sm truncate">
                {track.artist} • {track.album}
              </p>
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {formatDistanceToNow(new Date(track.playedAt), { addSuffix: true })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 