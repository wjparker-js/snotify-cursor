import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import AlbumHeader from '@/components/album/AlbumHeader';
import TrackList from '@/components/shared/TrackList';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getApiUrl } from '@/lib/config';

const AlbumDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tracksError, setTracksError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [trackDialogOpen, setTrackDialogOpen] = useState(false);
  const [trackUploading, setTrackUploading] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackForm, setTrackForm] = useState({
    title: '',
    artist: album?.artist || '',
    genre: '',
    year: '',
    trackNumber: '',
  });
  const audioInputRef = React.useRef<HTMLInputElement>(null);

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
      } finally {
        setTracksLoading(false);
      }
    };
    fetchTracks();
  }, [id]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.[0] || !id) return;
    setUploading(true);
    setCoverError(null);
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
      setCoverError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // Function to extract filename without extension
  const getFilenameWithoutExtension = (filename: string): string => {
    return filename.replace(/\.[^/.]+$/, "");
  };

  const handleTrackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      
      // Auto-fill the title with filename (without extension)
      const titleFromFilename = getFilenameWithoutExtension(file.name);
      setTrackForm(prev => ({
        ...prev,
        title: titleFromFilename
      }));
    }
  };

  const handleTrackFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTrackForm({ ...trackForm, [e.target.name]: e.target.value });
  };

  const handleTrackUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!audioFile || !trackForm.title) {
      setTrackError('Please provide a title and audio file.');
      return;
    }
    setTrackUploading(true);
    setTrackError(null);
    const formData = new FormData();
    formData.append('title', trackForm.title);
    formData.append('artist', trackForm.artist || album.artist);
    formData.append('genre', trackForm.genre);
    formData.append('year', trackForm.year);
    formData.append('track_number', trackForm.trackNumber);
    // Duration is now auto-detected by the backend, no need to send it
    formData.append('audio', audioFile);
    try {
      const response = await fetch(`/api/albums/${id}/tracks`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      setTrackDialogOpen(false);
      setAudioFile(null);
      setTrackForm({
        title: '',
        artist: album?.artist || '',
        genre: '',
        year: '',
        trackNumber: '',
      });
      if (audioInputRef.current) audioInputRef.current.value = '';
      window.location.reload();
    } catch (err) {
      setTrackError('Failed to upload track');
    } finally {
      setTrackUploading(false);
    }
  };

  // Map backend tracks to player Track interface
  const mappedTracks = useMemo(() =>
    tracks.map((track) => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      duration: track.duration,
      track_number: track.track_number || track.number || 0,
      audioUrl: track.url ? `/uploads/${track.url.replace(/^\/+/, '')}` : '',
      album: album?.title || '',
      albumArt: album ? `/api/albums/${album.id}/cover?t=${Date.now()}` : '',
    })),
    [tracks, album]
  );

  if (isLoading) {
    return <div className="flex justify-center items-center h-64 text-muted-foreground">Loading album...</div>;
  }
  if (error) {
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
    <div className="flex min-h-screen bg-bg">
      <main className="flex-1 p-8 overflow-y-auto">
        <AlbumHeader
          image={`/api/albums/${id}/cover?t=${Date.now()}`}
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
                    {coverError && <div className="text-red-500 text-center">{coverError}</div>}
                    <DialogFooter>
                      <button type="submit" className="bg-blue-600 text-white px-2 py-1 text-xs rounded" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload Cover'}</button>
                      <DialogClose asChild>
                        <button type="button" className="bg-gray-300 text-black px-2 py-1 text-xs rounded">Cancel</button>
                      </DialogClose>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog open={trackDialogOpen} onOpenChange={(open) => {
                setTrackDialogOpen(open);
                if (!open) {
                  setAudioFile(null);
                  setTrackForm({
                    title: '',
                    artist: album?.artist || '',
                    genre: '',
                    year: '',
                    trackNumber: '',
                  });
                  if (audioInputRef.current) audioInputRef.current.value = '';
                }
              }}>
                <DialogTrigger asChild>
                  <button className="bg-green-600 text-white px-2 py-1 text-xs rounded">Track Upload</button>
                </DialogTrigger>
                <DialogContent className="w-[360px] h-[420px] overflow-hidden py-4 px-4 text-xs">
                  <DialogHeader className="py-1">
                    <DialogTitle className="text-base">Upload Track</DialogTitle>
                    <DialogDescription className="text-xs">Upload an mp3 or m4a file and fill in the details below.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleTrackUpload} className="space-y-3 text-xs">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs mb-1 block">Audio File (MP3 or M4A)</label>
                      <input type="file" accept=".mp3,.m4a" ref={audioInputRef} onChange={handleTrackFileChange} className="border rounded p-1" />
                      {audioFile && <span className="text-xs text-green-400">Selected: {audioFile.name}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input name="title" value={trackForm.title} onChange={handleTrackFormChange} placeholder="Track title" className="h-7 text-xs border rounded px-2" required />
                      <input name="artist" value={trackForm.artist} onChange={handleTrackFormChange} placeholder="Artist name" className="h-7 text-xs border rounded px-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select name="genre" value={trackForm.genre} onChange={handleTrackFormChange} className="h-7 text-xs border rounded px-2">
                        <option value="">Select genre</option>
                        <option value="rock">Rock</option>
                        <option value="pop">Pop</option>
                        <option value="jazz">Jazz</option>
                        <option value="classical">Classical</option>
                        <option value="hip-hop">Hip Hop</option>
                        <option value="electronic">Electronic</option>
                        <option value="other">Other</option>
                      </select>
                      <input name="year" value={trackForm.year} onChange={handleTrackFormChange} placeholder="Year" className="h-7 text-xs border rounded px-2" />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <input name="trackNumber" value={trackForm.trackNumber} onChange={handleTrackFormChange} placeholder="Track Number" className="h-7 text-xs border rounded px-2" />
                    </div>
                    {trackError && <div className="text-red-500 text-center">{trackError}</div>}
                    <DialogFooter className="pt-1 gap-2">
                      <button type="button" className="bg-gray-300 text-black px-2 py-1 text-xs rounded" onClick={() => setTrackDialogOpen(false)} disabled={trackUploading}>Cancel</button>
                      <button type="submit" className="bg-green-600 text-white px-2 py-1 text-xs rounded" disabled={trackUploading}>{trackUploading ? 'Uploading...' : 'Upload Track'}</button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          }
        />
        <h2 className="text-xl font-semibold mb-4 text-text">Tracks</h2>
        {tracksLoading ? (
          <div className="text-muted text-center py-12">Loading tracks...</div>
        ) : tracksError ? (
          <div className="text-destructive text-center py-12">{tracksError}</div>
        ) : (
          <TrackList tracks={mappedTracks} isAdmin={true} />
        )}
      </main>
    </div>
  );
};

export default AlbumDetailsPage; 