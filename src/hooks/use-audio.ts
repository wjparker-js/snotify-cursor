
import { useState, useEffect, useRef } from 'react';

export function useAudio(audioSrc: string | undefined) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const previousVolume = useRef(volume);

  // Initialize audio element
  useEffect(() => {
    if (!audioSrc) {
      setLoadError("No audio source provided");
      return;
    }

    console.log("Creating audio element with source:", audioSrc);
    const audioElement = new Audio(audioSrc);
    audioElement.volume = volume;
    audioElement.muted = isMuted;
    
    // Handle any loading errors
    const handleError = (e: ErrorEvent) => {
      console.error("Audio loading error:", e);
      setLoadError(`Failed to load audio: ${e.message}`);
      setIsPlaying(false);
    };
    
    audioElement.addEventListener('error', handleError as EventListener);
    
    // Set up additional events
    const handleCanPlay = () => {
      console.log("Audio can play now");
      setLoadError(null); // Clear any previous errors
      
      // Try to play immediately if the player was just created
      if (audioElement && !audio) {
        console.log("First load - attempting autoplay");
        audioElement.play().catch(err => {
          console.log("Could not autoplay on first load:", err);
        });
      }
    };
    
    audioElement.addEventListener('canplay', handleCanPlay);
    
    // Clean up previous audio element
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    
    setAudio(audioElement);
    
    // Clean up audio element on unmount
    return () => {
      if (audioElement) {
        audioElement.removeEventListener('error', handleError as EventListener);
        audioElement.removeEventListener('canplay', handleCanPlay);
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioSrc]);

  // Set up event listeners for audio element
  useEffect(() => {
    if (!audio) return;
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('ended', handleEnded);
    
    // Update duration immediately if available
    if (audio.duration) {
      setDuration(audio.duration);
    }
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audio]);

  // Play/pause control
  useEffect(() => {
    if (!audio) return;
    
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error('Error playing audio:', err);
          setIsPlaying(false);
          setLoadError(`Playback error: ${err.message}`);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, audio]);

  // Mute control
  useEffect(() => {
    if (!audio) return;
    
    audio.muted = isMuted;
  }, [isMuted, audio]);

  // Volume control
  useEffect(() => {
    if (!audio) return;
    
    audio.volume = volume;
  }, [volume, audio]);

  const togglePlayPause = () => setIsPlaying(!isPlaying);
  
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(previousVolume.current);
    } else {
      previousVolume.current = volume;
      setIsMuted(true);
      setVolume(0);
    }
  };
  
  const seek = (time: number) => {
    if (!audio) return;
    
    audio.currentTime = time;
    setCurrentTime(time);
  };
  
  const skipForward = () => {
    if (!audio) return;
    
    const newTime = Math.min(audio.currentTime + 10, duration);
    seek(newTime);
  };
  
  const skipBack = () => {
    if (!audio) return;
    
    const newTime = Math.max(audio.currentTime - 10, 0);
    seek(newTime);
  };

  return {
    audio,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    loadError,
    togglePlayPause,
    toggleMute,
    seek,
    setVolume,
    skipForward,
    skipBack
  };
}
