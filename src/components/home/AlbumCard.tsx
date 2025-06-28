import React, { useState, useEffect } from 'react';
import { Play, Pause, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';
import { getUploadsUrl, getApiUrl } from '@/lib/config';
import { useImageCache } from '@/hooks/use-image-cache';

// TODO: Implement album card functionality using MySQL/Prisma and local file storage. Supabase logic removed.

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  audioUrl: string;
  duration?: string;
  track_number?: number;
}



const getTrackAudioUrl = (audio_path: string | null | undefined) => {
  if (!audio_path) return '';
  if (/^https?:\/\//i.test(audio_path)) return audio_path;
  return getUploadsUrl(audio_path);
};

const AlbumCard: React.FC<{ album: any }> = ({ album }) => {
  const navigate = useNavigate();
  const { playTrack } = useMediaPlayer();
  const [isLoading, setIsLoading] = useState(false);
  
  // Always use the API endpoint for consistency
  const imageUrl = album.id 
    ? getApiUrl(`/api/albums/${album.id}/cover`)
    : '/placeholder.svg';

  // Use the image cache hook for better performance
  const { imageUrl: cachedImageUrl, isLoading: imageLoading, error: imageError } = useImageCache(imageUrl);

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      // Fetch album tracks
      const response = await fetch(getApiUrl(`/api/songs/album/${album.id}`));
      if (!response.ok) throw new Error('Failed to fetch tracks');
      
      const tracks = await response.json();
      
      if (tracks.length > 0) {
        // Format tracks for the media player
        const formattedTracks: Track[] = tracks.map((track: any) => ({
          id: track.id.toString(),
          title: track.title,
          artist: album.artist,
          album: album.title,
          albumArt: cachedImageUrl,
          audioUrl: getTrackAudioUrl(track.audio_path),
          duration: track.duration,
          track_number: track.track_number
        }));

        // Start playing the first track with the full playlist
        playTrack(formattedTracks[0], formattedTracks, 'album', album.id.toString());
        
        // Navigate to album details page
        navigate(`/albums/${album.id}`);
      }
    } catch (error) {
      console.error('Error starting album playback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link to={`/albums/${album.id}`} className="block group w-full">
      <div className="bg-background rounded-lg shadow-md p-4 flex flex-col items-center group hover:shadow-lg transition-all w-full" style={{ overflow: 'hidden' }}>
        <div className="relative w-full flex justify-center mb-3">
          <div className="relative w-[85vw] max-w-[400px] sm:w-[116px] sm:h-[116px] aspect-square">
            {/* Show loading placeholder while image is loading */}
            {imageLoading && (
              <div className="absolute inset-0 bg-muted rounded-md flex items-center justify-center">
                <div className="text-muted-foreground text-xs">Loading...</div>
              </div>
            )}
            <img
              src={cachedImageUrl}
              alt={album.title}
              className={`w-full h-full object-cover rounded-md transition-opacity duration-200 ${
                !imageLoading ? 'opacity-100' : 'opacity-0'
              }`}
              loading="eager"
            />
          </div>
          <Button
            variant="default"
            size="icon"
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handlePlayClick}
            disabled={isLoading}
            aria-label={`Play ${album.title}`}
          >
            <Play className="w-5 h-5" />
          </Button>
        </div>
        <div className="w-full text-center">
          <h3 className="font-semibold text-base truncate">{album.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{album.artist}</p>
        </div>
      </div>
    </Link>
  );
};

export default AlbumCard;
