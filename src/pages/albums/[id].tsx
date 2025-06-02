import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AlbumHeader from '@/components/album/AlbumHeader';
import TrackList from '@/components/shared/TrackList';

const AlbumDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tracksError, setTracksError] = useState<string | null>(null);

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
          image={album.image_url || '/placeholder.svg'}
          title={album.title}
          artist={album.artist}
          year={album.year}
          trackCount={album.track_count}
          duration={album.duration}
        />
        <h2 className="text-xl font-semibold mb-4 text-text">Tracks</h2>
        {tracksLoading ? (
          <div className="text-muted text-center py-12">Loading tracks...</div>
        ) : tracksError ? (
          <div className="text-destructive text-center py-12">{tracksError}</div>
        ) : (
          <TrackList tracks={tracks} isAdmin={true} />
        )}
      </main>
    </div>
  );
};

export default AlbumDetailsPage; 