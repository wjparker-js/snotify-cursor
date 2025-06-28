import { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  audioUrl: string;
  shareUrl?: string;
}

interface QueueItem {
  track: Track;
  source: 'playlist' | 'album' | 'search' | 'recommendation';
  sourceId?: string;
  addedAt: Date;
}

interface MediaPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  progress: number;
  playlist: Track[];
  queue: QueueItem[];
  currentIndex: number;
  playTrack: (track: Track, playlist?: Track[], source?: QueueItem['source'], sourceId?: string) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  seekTo: (position: number) => void;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  playNext: () => void;
  playPrevious: () => void;
  addToQueue: (track: Track, source?: QueueItem['source'], sourceId?: string) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  shareTrack: (platform: 'twitter' | 'facebook' | 'instagram') => void;
}

const MediaPlayerContext = createContext<MediaPlayerContextType | null>(null);

export function MediaPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't capture keyboard shortcuts when user is typing in an input field
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      // Space bar for play/pause
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (isPlaying) {
          pauseTrack();
        } else {
          resumeTrack();
        }
      }
      // Arrow keys for seeking
      else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (audioRef.current) {
          const newTime = Math.max(0, audioRef.current.currentTime - 5);
          audioRef.current.currentTime = newTime;
        }
      }
      else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (audioRef.current) {
          const newTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 5);
          audioRef.current.currentTime = newTime;
        }
      }
      // M for mute
      else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      }
      // N for next track
      else if (e.code === 'KeyN') {
        e.preventDefault();
        playNext();
      }
      // P for previous track
      else if (e.code === 'KeyP') {
        e.preventDefault();
        playPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  const playTrack = (track: Track, newPlaylist?: Track[], source?: QueueItem['source'], sourceId?: string) => {
    if (!audioRef.current) return;
    audioRef.current.src = track.audioUrl;
    audioRef.current.volume = isMuted ? 0 : volume;
    audioRef.current.currentTime = 0;
    audioRef.current.play().then(() => {
      setCurrentTrack(track);
      setIsPlaying(true);
      setIsVisible(true);
      if (newPlaylist) {
        setPlaylist(newPlaylist);
        setCurrentIndex(newPlaylist.findIndex(t => t.id === track.id));
      }
      if (source && !playlist.some(t => t.id === track.id)) {
        addToQueue(track, source, sourceId);
      }
    }).catch(error => {
      console.error('Error playing track:', error);
    });
  };

  const addToQueue = (track: Track, source?: QueueItem['source'], sourceId?: string) => {
    setQueue(prev => [...prev, {
      track,
      source: source || 'search',
      sourceId,
      addedAt: new Date()
    }]);
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const playNext = () => {
    if (queue.length > 0) {
      // Play next track from queue
      const nextTrack = queue[0];
      setQueue(prev => prev.slice(1));
      playTrack(nextTrack.track, undefined, nextTrack.source, nextTrack.sourceId);
    } else if (playlist.length > 0 && currentIndex !== -1) {
      // Play next track from playlist
      const nextIndex = (currentIndex + 1) % playlist.length;
      setCurrentIndex(nextIndex);
      playTrack(playlist[nextIndex]);
    }
  };

  const playPrevious = () => {
    if (playlist.length > 0 && currentIndex !== -1) {
      const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
      setCurrentIndex(prevIndex);
      playTrack(playlist[prevIndex]);
    }
  };

  const shareTrack = (platform: 'twitter' | 'facebook' | 'instagram') => {
    if (!currentTrack) return;

    const shareText = `🎵 Listening to "${currentTrack.title}" by ${currentTrack.artist} on Snotify`;
    const shareUrl = currentTrack.shareUrl || window.location.href;

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing via URL
        // We could generate a story image with the track info
        // and let the user download it to share
        const storyImage = generateStoryImage(currentTrack);
        downloadStoryImage(storyImage);
        break;
    }
  };

  const generateStoryImage = (track: Track) => {
    // Create a canvas with track info and album art
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw album art
    const img = new Image();
    img.src = track.albumArt;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.width);

    // Draw track info
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.fillText(track.title, 40, canvas.width + 100);
    ctx.font = '36px Arial';
    ctx.fillText(track.artist, 40, canvas.width + 160);

    return canvas.toDataURL('image/png');
  };

  const downloadStoryImage = (dataUrl: string | null) => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = 'snotify-story.png';
    link.href = dataUrl;
    link.click();
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resumeTrack = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const handleEnded = () => {
      playNext();
    };
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef, playNext]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const seekTo = (position: number) => {
    if (!audioRef.current) return;
    const newTime = (position / 100) * (audioRef.current.duration || 0);
    audioRef.current.currentTime = newTime;
    setProgress(position);
  };

  return (
    <MediaPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        isMuted,
        progress,
        playlist,
        queue,
        currentIndex,
        playTrack,
        pauseTrack,
        resumeTrack,
        setVolume,
        toggleMute,
        seekTo,
        isVisible,
        setIsVisible,
        playNext,
        playPrevious,
        addToQueue,
        removeFromQueue,
        clearQueue,
        shareTrack
      }}
    >
      {children}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </MediaPlayerContext.Provider>
  );
}

export function useMediaPlayer() {
  const context = useContext(MediaPlayerContext);
  if (!context) {
    throw new Error('useMediaPlayer must be used within a MediaPlayerProvider');
  }
  return context;
} 