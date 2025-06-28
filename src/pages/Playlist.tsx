import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import AlbumHeader from '@/components/album/AlbumHeader';
import TrackList from '@/components/shared/TrackList';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { getUploadsUrl, getApiUrl } from '@/lib/config';

// TODO: Implement single playlist functionality using MySQL/Prisma. Supabase logic removed.

const PLAYLIST_COVER_IMAGE = 'https://images-na.ssl-images-amazon.com/images/I/91rO1rQ1HLL.jpg'; // Use the provided album covers image

interface PlaylistSong {
  id: number;
  song: {
    id: number;
    title: string;
    artist: string;
    duration?: number;
    url?: string;
    albumId?: number;
  };
}

interface Playlist {
  id: number;
  name: string;
  description?: string;
  cover_image_url?: string;
  user?: { name: string };
  playlistsong?: PlaylistSong[];
}

const Playlist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tracks = playlist?.playlistsong?.map((ps, index) => ({
    id: ps.song.id,
    title: ps.song.title,
    artist: ps.song.artist,
    duration: ps.song.duration || 0,
    audioUrl: ps.song.url ? getUploadsUrl(ps.song.url) : '',
    albumArt: ps.song.albumId ? getApiUrl(`/api/albums/${ps.song.albumId}/cover`) : '/placeholder.svg',
    position: index + 1,
  })) || [];

  useEffect(() => {
    if (!id) return;
    const fetchPlaylist = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(getApiUrl(`/api/playlists/${id}`));
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch playlist');
        setPlaylist(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaylist();
  }, [id]);

  const coverUrl = id ? getApiUrl(`/api/playlists/${id}/cover?${Date.now()}`) : '/placeholder.svg';

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('cover', file);
    try {
      const response = await fetch(getApiUrl(`/api/playlists/${id}/cover`), {
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
        artist={playlist.user?.name || 'Unknown'}
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
          <form onSubmit={(e) => { e.preventDefault(); handleUpload(e as React.ChangeEvent<HTMLInputElement>); }} className="flex flex-col gap-4">
            <input type="file" accept="image/*" ref={fileInputRef} className="border rounded p-1" onChange={handleUpload} />
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
