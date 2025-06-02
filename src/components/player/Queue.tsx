import { useMediaPlayer } from '@/contexts/MediaPlayerContext';
import { X, Clock, Music, Headphones, Search, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Queue() {
  const { queue, removeFromQueue, clearQueue, currentTrack } = useMediaPlayer();

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'playlist':
        return <Music className="w-4 h-4" />;
      case 'album':
        return <Headphones className="w-4 h-4" />;
      case 'recommendation':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  if (queue.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        <p>Your queue is empty</p>
        <p className="text-sm">Add tracks to your queue to play them next</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Up Next</h3>
        <button
          onClick={clearQueue}
          className="text-gray-400 hover:text-white transition-colors"
        >
          Clear Queue
        </button>
      </div>

      <div className="divide-y divide-gray-800">
        {queue.map((item, index) => (
          <div
            key={`${item.track.id}-${index}`}
            className="p-4 flex items-center gap-4 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex-shrink-0">
              <img
                src={item.track.albumArt}
                alt={item.track.title}
                className="w-12 h-12 rounded"
              />
            </div>

            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white truncate">{item.track.title}</span>
                {getSourceIcon(item.source)}
              </div>
              <div className="text-sm text-gray-400 truncate">
                {item.track.artist}
              </div>
              <div className="text-xs text-gray-500">
                Added {formatDistanceToNow(item.addedAt, { addSuffix: true })}
              </div>
            </div>

            <button
              onClick={() => removeFromQueue(index)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 