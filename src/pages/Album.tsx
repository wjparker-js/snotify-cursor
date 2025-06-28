import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import AlbumHeader from '@/components/album/AlbumHeader';
import TrackList from '@/components/shared/TrackList';
import AddTrackDialog from '@/components/album/AddTrackDialog';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { getUploadsUrl } from '@/lib/config';
import { toast } from '@/components/ui/use-toast';

const Album: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tracksError, setTracksError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    const fetchAlbum = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/albums/${id}`);
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
        const response = await fetch(`/api/albums/${id}/tracks`);
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

  const trackListData = tracks.map((track, index) => ({
    id: track.id,
    title: track.title,
    artist: track.artist,
    duration: track.duration || 0,
    audioUrl: track.url ? getUploadsUrl(track.url) : '',
    albumArt: `/api/albums/${id}/cover`,
    position: index + 1,
  }));

  const coverUrl = id ? `/api/albums/${id}/cover?t=${Date.now()}` : '/placeholder.svg';

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.[0] || !id) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('cover', fileInputRef.current.files[0]);
    try {
      const response = await fetch(`/api/albums/${id}/cover`, {
        method: 'POST',
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

  if (isLoading) return <div className="text-muted text-center py-12">Loading album...</div>;
  if (error && !modalOpen) return <div className="text-red-500 text-center py-12">{error}</div>;
  if (!album) return <div className="text-muted text-center py-12">Album not found.</div>;

  return (
    <div className="flex min-h-screen bg-bg">
      <main className="flex-1 p-8 overflow-y-auto">
        <AlbumHeader
          image={coverUrl}
          title={album.title}
          artist={album.artist}
          year={album.year}
          trackCount={album.track_count}
          duration={album.duration}
          actions={
            <>
              <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger asChild>
                  <button className="bg-theme-color text-white px-2 py-1 text-xs rounded">Upload/Change Cover</button>
                </DialogTrigger>
                <DialogContent className="w-[400px] h-[530px] overflow-hidden py-6 px-6 text-xs">
                  <DialogHeader className="py-1">
                    <DialogTitle className="text-base">Upload Album Cover</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpload} className="flex flex-col gap-4">
                    <input type="file" accept="image/*" ref={fileInputRef} className="border rounded p-1" />
                    {error && <div className="text-red-500 text-center">{error}</div>}
                    <DialogFooter>
                      <button type="submit" className="bg-theme-color text-white px-2 py-1 text-xs rounded" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload Cover'}</button>
                      <DialogClose asChild>
                        <button type="button" className="bg-gray-300 text-black px-2 py-1 text-xs rounded">Cancel</button>
                      </DialogClose>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <AddTrackDialog albumId={album.id} albumTitle={album.title} artist={album.artist}>
                <button className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-xs rounded transition-colors">Track Upload</button>
              </AddTrackDialog>
            </>
          }
        />
        <h2 className="text-xl font-semibold mb-4 text-text">Tracks</h2>
        {tracksLoading ? (
          <div className="text-muted text-center py-12">Loading tracks...</div>
        ) : tracksError ? (
          <div className="text-destructive text-center py-12">{tracksError}</div>
        ) : (
          <TrackList tracks={trackListData} />
        )}
      </main>
    </div>
  );
};

export default Album;