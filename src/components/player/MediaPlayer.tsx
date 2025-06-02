import { Play, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';
import { useState, useEffect } from 'react';

export default function MediaPlayer() {
  const {
    isPlaying,
    volume,
    isMuted,
    progress,
    pauseTrack,
    resumeTrack,
    setVolume,
    toggleMute,
    seekTo,
    playNext,
    playPrevious,
    currentTrack,
  } = useMediaPlayer();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="fixed bottom-0 left-64 right-0 bg-gray-900 border-t border-gray-800 z-50 flex justify-center" style={{ height: '44px' }}>
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 cursor-pointer flex items-center"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pos = (e.clientX - rect.left) / rect.width;
          seekTo(pos * 100);
        }}
        style={{ zIndex: 2 }}
      >
        <div
          className="h-full bg-blue-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* Controls */}
      <div className="flex items-center justify-center gap-5 w-full max-w-4xl mx-auto" style={{ padding: '0.5rem 0', height: '44px' }}>
        <button
          onClick={playPrevious}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Previous track"
          style={{ width: 28, height: 28 }}
        >
          <SkipBack className="w-5 h-5" />
        </button>
        <button
          onClick={isPlaying ? pauseTrack : resumeTrack}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isPlaying ? 'bg-blue-600 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'}`}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          disabled={!currentTrack}
        >
          {isPlaying ? (
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          ) : (
            <Play className="w-5 h-5 text-white" />
          )}
        </button>
        <button
          onClick={playNext}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Next track"
          style={{ width: 28, height: 28 }}
        >
          <SkipForward className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={toggleMute}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            style={{ width: 24, height: 24 }}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 md:w-24 accent-blue-500"
            aria-label="Volume"
            style={{ height: 4 }}
          />
        </div>
      </div>
    </div>
  );
} 