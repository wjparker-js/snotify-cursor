/**
 * AudioPlayer component provides the core audio playback functionality.
 * It handles:
 * - Play/pause controls
 * - Volume control
 * - Seek functionality 
 * - Time display
 * - Mute toggle
 */

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

interface AudioPlayerProps {
  audioSrc: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc }) => {
  // State management for audio playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Initialize audio element and set up event listeners
  useEffect(() => {
    if (!audioSrc) {
      setLoadError("No audio source provided");
      return;
    }

    const audio = new Audio(audioSrc);
    audio.id = 'audio-player';
    audio.volume = volume;
    audio.muted = isMuted;
    audioRef.current = audio;

    const handleCanPlay = () => {
      setLoadError(null);
      setDuration(audio.duration);
      audio.play().catch(err => {
        console.error("Autoplay failed:", err);
      });
    };

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e: ErrorEvent) => {
      console.error("Audio error:", e);
      setLoadError("Failed to load audio");
      setIsPlaying(false);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    // Set up event listeners
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError as EventListener);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError as EventListener);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioSrc]);

  // Update volume when changed
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  // Update mute state when changed
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = isMuted;
  }, [isMuted]);

  // Format time display (e.g., "3:45")
  const formatTime = (time: number): string => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Playback control functions
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error("Play failed:", err);
        toast({
          title: "Playback Error",
          description: "Failed to play audio. Please try again.",
          variant: "destructive"
        });
      });
    }
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const skipForward = () => {
    if (!audioRef.current) return;
    const newTime = Math.min(audioRef.current.currentTime + 10, duration);
    seek(newTime);
  };

  const skipBack = () => {
    if (!audioRef.current) return;
    const newTime = Math.max(audioRef.current.currentTime - 10, 0);
    seek(newTime);
  };

  return (
    <div className="flex flex-col w-full max-w-[900px] gap-1">
      <div className="flex items-center justify-between w-full mb-1">
        <div className="flex items-center gap-2">
          <button onClick={skipBack} className="text-zinc-400 hover:text-white transition-colors">
            <SkipBack size={isMobile ? 18 : 20} />
          </button>
          <button onClick={togglePlayPause} className="text-white hover:text-theme-color transition-colors">
            {isPlaying ? <Pause size={isMobile ? 22 : 24} /> : <Play size={isMobile ? 22 : 24} />}
          </button>
          <button onClick={skipForward} className="text-zinc-400 hover:text-white transition-colors">
            <SkipForward size={isMobile ? 18 : 20} />
          </button>
          <span className="text-xs text-zinc-400 ml-1">{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition-colors">
            {isMuted ? <VolumeX size={isMobile ? 16 : 18} /> : <Volume2 size={isMobile ? 16 : 18} />}
          </button>
          <Slider
            defaultValue={[volume]}
            max={1}
            step={0.01}
            value={[volume]}
            onValueChange={(values) => setVolume(values[0])}
            className="w-20 md:w-28 h-1"
          />
        </div>
      </div>
      
      <div className="w-full">
        <Slider
          defaultValue={[0]}
          max={duration || 100}
          step={1}
          value={[currentTime]}
          onValueChange={(values) => seek(values[0])}
          className="w-full h-1"
        />
      </div>
    </div>
  );
};

export default AudioPlayer;