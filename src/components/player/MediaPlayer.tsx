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
    <div 
      className={`fixed bottom-0 bg-gray-900 border-t border-gray-800 z-50 ${isMobile ? 'mobile-media-player left-0 right-0' : 'desktop-media-player'}`} 
      style={{ 
        height: isMobile ? '29px' : '32px',
        left: isMobile ? '0' : '256px', // 64 * 4 = 256px (w-64 in Tailwind)
        right: '0'
      }}
    >
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
      {/* Controls Container - Centered */}
      <div className="flex items-center justify-center h-full px-4">
        <div className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-0.5 shadow-lg max-w-xs">{/* Controls */}
          <button
            onClick={playPrevious}
            className="text-gray-300 hover:text-white transition-colors p-1.5"
            aria-label="Previous track"
          >
                          <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={isPlaying ? pauseTrack : resumeTrack}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isPlaying ? 'bg-blue-600 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'}`}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            disabled={!currentTrack}
          >
            {isPlaying ? (
                              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ) : (
                              <Play className="w-4 h-4 text-white" />
            )}
          </button>
          <button
            onClick={playNext}
            className="text-gray-300 hover:text-white transition-colors p-1.5"
            aria-label="Next track"
          >
                          <SkipForward className="w-3.5 h-3.5" />
          </button>
                      <div className="flex items-center gap-1.5 ml-1.5">
            <button
              onClick={toggleMute}
              className="text-gray-300 hover:text-white transition-colors p-0.5"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 accent-blue-500"
              aria-label="Volume"
              style={{ height: 4 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 