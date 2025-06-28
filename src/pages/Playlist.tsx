import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import AlbumHeader from '@/components/album/AlbumHeader';
import TrackList from '@/components/shared/TrackList';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { getUploadsUrl } from '@/lib/config';

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
    albumArt: ps.song.albumId ? `/api/albums/${ps.song.albumId}/cover` : '/placeholder.svg',
    position: index + 1,
  })) || [];

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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaylist();
  }, [id]);

  const coverUrl = id ? `/api/playlists/${id}/cover?t=${Date.now()}` : '/placeholder.svg';

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
    <div className="flex min-h-screen bg-bg">
      <main className="flex-1 p-8 overflow-y-auto">
        <AlbumHeader
          image={coverUrl}
          title={playlist.name}
          artist={playlist.user?.name || 'Unknown'}
          year={''}
          trackCount={tracks.length.toString()}
          duration={''}
          actions={
            <>
              <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger asChild>
                  <button className="bg-theme-color text-white px-2 py-1 text-xs rounded">Upload/Change Cover</button>
                </DialogTrigger>
                <DialogContent className="w-[400px] h-[530px] overflow-hidden py-6 px-6 text-xs">
                  <DialogHeader className="py-1">
                    <DialogTitle className="text-base">Upload Playlist Cover</DialogTitle>
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
            </>
          }
        />
        <h2 className="text-xl font-semibold mb-4 text-text">Tracks</h2>
        <TrackList tracks={tracks} />
      </main>
    </div>
  );
};

export default Playlist;
