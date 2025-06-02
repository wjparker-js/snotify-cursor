import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import AlbumHeader from '@/components/album/AlbumHeader';
import TrackList from '@/components/shared/TrackList';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';

// TODO: Implement single playlist functionality using MySQL/Prisma. Supabase logic removed.

const PLAYLIST_COVER_IMAGE = 'https://images-na.ssl-images-amazon.com/images/I/91rO1rQ1HLL.jpg'; // Use the provided album covers image

const Playlist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    const fetchPlaylist = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/playlists/${id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch playlist');
        setPlaylist(data);
        setTracks(data.playlistsong?.map((ps: any, idx: number) => ({
          ...ps.song,
          track_number: idx + 1
        })) || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch playlist');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaylist();
  }, [id]);

  const coverUrl = id ? `/api/playlists/${id}/cover?${Date.now()}` : '/placeholder.svg';

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.[0] || !id) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('cover', fileInputRef.current.files[0]);
    try {
      const response = await fetch(`/api/playlists/${id}/cover`, {
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

  if (isLoading) return <div className="text-muted text-center py-12">Loading playlist...</div>;
  if (error && !modalOpen) return <div className="text-red-500 text-center py-12">{error}</div>;
  if (!playlist) return <div className="text-muted text-center py-12">Playlist not found.</div>;

  return (
    <div className="p-6">
      <AlbumHeader
        image={coverUrl}
        title={playlist.name}
        artist={playlist.user?.name || playlist.owner || 'Unknown'}
        year={''}
        trackCount={tracks.length.toString()}
        duration={''}
      />
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogTrigger asChild>
          <button className="bg-blue-600 text-white px-3 py-1 rounded my-4">Upload/Change Cover</button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Playlist Cover</DialogTitle>
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
      <TrackList tracks={tracks} />
    </div>
  );
};

export default Playlist;
