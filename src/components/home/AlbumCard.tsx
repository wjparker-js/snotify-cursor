import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';

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

const getAlbumImageUrl = (image_url: string | null | undefined) => {
  if (!image_url) return '/placeholder.svg';
  // If the image_url is an absolute URL (http/https), use as is
  if (/^https?:\/\//i.test(image_url)) return image_url;
  // Otherwise, treat as relative and prefix with backend uploads URL
  return `http://localhost:4000/uploads/${image_url.replace(/^\/+|\\/g, '/')}`;
};

const getTrackAudioUrl = (audio_path: string | null | undefined) => {
  if (!audio_path) return '';
  if (/^https?:\/\//i.test(audio_path)) return audio_path;
  return `http://localhost:4000/uploads/${audio_path.replace(/^\/+|\\/g, '/')}`;
};

const AlbumCard: React.FC<{ album: any }> = ({ album }) => {
  const navigate = useNavigate();
  const { playTrack } = useMediaPlayer();
  const [isLoading, setIsLoading] = useState(false);
  const imageUrl = album.id ? `/api/albums/${album.id}/cover` : '/placeholder.svg';

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      // Fetch album tracks
      const response = await fetch(`/api/albums/${album.id}/tracks`);
      if (!response.ok) throw new Error('Failed to fetch tracks');
      
      const tracks = await response.json();
      
      if (tracks.length > 0) {
        // Format tracks for the media player
        const formattedTracks: Track[] = tracks.map((track: any) => ({
          id: track.id.toString(),
          title: track.title,
          artist: album.artist,
          album: album.title,
          albumArt: imageUrl,
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
          <img
            src={imageUrl}
            alt={album.title}
            className="object-cover rounded-md mobile-card-image"
            style={{ width: 116, height: 116, maxWidth: '100%', maxHeight: '100%' }}
            onError={e => (e.currentTarget.src = '/placeholder.svg')}
          />
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
