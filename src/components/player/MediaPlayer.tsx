import { Play, Volume2, VolumeX, SkipBack, SkipForward, ChevronUp, ChevronDown, Share2, List } from 'lucide-react';
import VUMeter from '../profile/VUMeter';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';
import { useState, useEffect } from 'react';
import Queue from './Queue';

export default function MediaPlayer() {
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    progress,
    queue,
    pauseTrack,
    resumeTrack,
    setVolume,
    toggleMute,
    seekTo,
    isVisible,
    playNext,
    playPrevious,
    shareTrack
  } = useMediaPlayer();

  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
      {/* Progress Bar */}
      <div 
        className="h-1 bg-gray-800 cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pos = (e.clientX - rect.left) / rect.width;
          seekTo(pos * 100);
        }}
      >
        <div 
          className="h-full bg-blue-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Mini Player (Mobile) */}
      {isMobile && !isExpanded && (
        <div className="p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={isPlaying ? pauseTrack : resumeTrack}
              className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <VUMeter isPlaying={true} />
              ) : (
                <Play className="w-4 h-4 text-white" />
              )}
            </button>
            <span className="text-white text-sm truncate">
              {currentTrack?.title}
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-gray-400 hover:text-white"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Full Player */}
      <div className={`p-4 ${isMobile && !isExpanded ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <img
              src={currentTrack?.albumArt}
              alt={currentTrack?.title}
              className="w-12 h-12 rounded"
            />
            <div className="min-w-0">
              <div className="text-white truncate">{currentTrack?.title}</div>
              <div className="text-sm text-gray-400 truncate">{currentTrack?.artist}</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-center">
            <button
              onClick={playPrevious}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={isPlaying ? pauseTrack : resumeTrack}
              className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <VUMeter isPlaying={true} />
              ) : (
                <Play className="w-5 h-5 text-white" />
              )}
            </button>

            <button
              onClick={playNext}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-center">
            {/* Queue Button */}
            <button
              onClick={() => setShowQueue(!showQueue)}
              className="text-gray-400 hover:text-white transition-colors relative"
            >
              <List className="w-5 h-5" />
              {queue.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {queue.length}
                </span>
              )}
            </button>

            {/* Share Button */}
            <div className="relative group">
              <button className="text-gray-400 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-lg p-2 hidden group-hover:block">
                <button
                  onClick={() => shareTrack('twitter')}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 rounded"
                >
                  Share on Twitter
                </button>
                <button
                  onClick={() => shareTrack('facebook')}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 rounded"
                >
                  Share on Facebook
                </button>
                <button
                  onClick={() => shareTrack('instagram')}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 rounded"
                >
                  Share on Instagram
                </button>
              </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 md:w-32 accent-blue-500"
              />
            </div>

            {/* Mobile Expand/Collapse */}
            {isMobile && (
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Queue Panel */}
      {showQueue && (
        <div className="fixed bottom-20 right-4 w-96 bg-gray-900 rounded-lg shadow-xl border border-gray-800">
          <Queue />
        </div>
      )}
    </div>
  );
} 