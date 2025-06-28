import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle, PauseCircle, Heart, MoreHorizontal, ChevronLeft } from 'lucide-react';
import { TrackList } from '@/components/albums/TrackList';
import { AlbumHeader } from '@/components/albums/AlbumHeader';
import AlbumActions from '@/components/album/AlbumActions';
import AddTrackDialog from '@/components/album/AddTrackDialog';
import AlbumNotFound from '@/components/album/AlbumNotFound';
import RelatedAlbums from '@/components/album/RelatedAlbums';
import { useMobileResponsive } from '@/hooks/use-mobile-responsive';
import { useAlbumData } from '@/hooks/use-album-data';
import { toast } from '@/components/ui/use-toast';
import { getUploadsUrl, getApiUrl } from '@/lib/config';
import Player from '@/components/player/AudioPlayer';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';

// TODO: Implement album page functionality using MySQL/Prisma. Supabase logic removed.

const Album: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tracksError, setTracksError] = useState<string | null>(null);
  const [relatedAlbums, setRelatedAlbums] = useState<any[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [relatedError, setRelatedError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    const fetchAlbum = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(getApiUrl(`/api/albums/${id}`), {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch album');
        setAlbum(data);
      } catch (err: any) {
        setError(err.message);
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlbum();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchTracks = async () => {
      setTracksLoading(true);
      setTracksError(null);
      try {
        const response = await fetch(getApiUrl(`/api/albums/${id}/tracks`), {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch tracks');
        setTracks(data);
      } catch (err: any) {
        setTracksError(err.message);
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      } finally {
        setTracksLoading(false);
      }
    };
    fetchTracks();
  }, [id]);

  useEffect(() => {
    if (!album || !album.artist) return;
    const fetchRelatedAlbums = async () => {
      setRelatedLoading(true);
      setRelatedError(null);
      try {
        const response = await fetch(getApiUrl(`/api/albums?artist=${encodeURIComponent(album.artist)}`), {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch related albums');
        // Exclude the current album from related
        setRelatedAlbums(Array.isArray(data) ? data.filter((a: any) => a.id !== album.id) : []);
      } catch (err: any) {
        setRelatedError(err.message);
      } finally {
        setRelatedLoading(false);
      }
    };
    fetchRelatedAlbums();
  }, [album]);

  const getTrackAudioUrl = (audio_path: string | null | undefined) => {
    if (!audio_path) return '';
    if (/^https?:\/\//i.test(audio_path)) return audio_path;
    return getUploadsUrl(audio_path);
  };

  const getAlbumCoverUrl = () => {
    if (!id) return '/placeholder.svg';
    return getApiUrl(`/api/albums/${id}/cover?${Date.now()}`);
  };

  const coverUrl = getAlbumCoverUrl();

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.[0] || !id) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('cover', fileInputRef.current.files[0]);
    try {
      const response = await fetch(getApiUrl(`/api/albums/${id}/cover`), {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      setModalOpen(false);
      window.location.reload();
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64 text-muted-foreground">Loading album...</div>;
  }
  if (error && !modalOpen) {
    return <div className="flex flex-col items-center justify-center h-64">
      <h1 className="text-xl font-bold mb-2">Album</h1>
      <p className="text-destructive mb-4">{error}</p>
    </div>;
  }
  if (!album) {
    return <div className="flex flex-col items-center justify-center h-64">
      <h1 className="text-xl font-bold mb-2">Album</h1>
      <p className="text-muted-foreground">Album not found.</p>
    </div>;
  }

  return (
    <div className="px-4 md:px-8 py-6 w-full max-w-4xl mx-auto">
      <AlbumHeader
        image={coverUrl}
        title={album.title}
        artist={album.artist}
        year={album.year}
        trackCount={album.track_count}
        duration={album.duration}
      />
      <button style={{zIndex: 9999, background: 'red', color: 'white'}}>TEST BUTTON</button>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogTrigger asChild>
          <button className="bg-blue-600 text-white px-3 py-1 rounded my-4">Upload/Change Cover</button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Album Cover</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="flex flex-col gap-4">
            <input type="file" accept="image/*" ref={fileInputRef} className="border rounded p-1" />
            {error && <div className="text-red-500 text-center">{error}</div>}
            <DialogFooter>
              <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload Cover'}</button>
              <DialogClose asChild>
                <button type="button" className="bg-gray-300 text-black px-3 py-1 rounded">Cancel</button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {album.id && (
        <section className="mb-4">
          <AlbumActions 
            albumId={album.id} 
            albumTitle={album.title} 
            artist={album.artist}
          />
        </section>
      )}
      <div className="mt-8">
        {tracksLoading ? (
          <div className="flex justify-center items-center h-32 text-muted-foreground">Loading tracks...</div>
        ) : tracksError ? (
          <div className="text-destructive mb-4">{tracksError}</div>
        ) : (
          <TrackList tracks={tracks} onPlayTrack={setSelectedTrack} />
        )}
      </div>
      {selectedTrack && (
        <div className="fixed bottom-0 left-0 w-full z-50 bg-zinc-900 border-t border-zinc-800 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-2">
            <Player audioSrc={getTrackAudioUrl(selectedTrack.audio_path)} />
          </div>
        </div>
      )}
      <div className="mt-8">
        {relatedLoading ? (
          <div className="flex justify-center items-center h-32 text-muted-foreground">Loading related albums...</div>
        ) : relatedError ? (
          <div className="text-destructive mb-4">{relatedError}</div>
        ) : relatedAlbums.length > 0 ? (
          <RelatedAlbums albums={relatedAlbums} artist={album.artist} />
        ) : null}
      </div>
    </div>
  );
};

export default Album;