import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { AlbumGrid } from '@/components/albums/AlbumGrid';
import { TrackList } from '@/components/shared/TrackList';
import { useRouter } from 'next/navigation';
import { artistService } from '@/services/artistService';
import { Artist, Album, Track } from '@/types';

export default function ArtistDetailsPage({ params }: { params: { id: string } }) {
  const [activeItemId, setActiveItemId] = useState<string | number | undefined>(params.id);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [popularTracks, setPopularTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [artistData, albumsData, tracksData] = await Promise.all([
          artistService.getArtist(params.id),
          artistService.getArtistAlbums(params.id),
          artistService.getArtistPopularTracks(params.id)
        ]);

        setArtist(artistData);
        setAlbums(albumsData);
        setPopularTracks(tracksData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load artist data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [params.id]);

  const handleAlbumClick = (album: Album) => {
    setActiveItemId(album.id);
    router.push(`/albums/${album.id}`);
  };

  const handleTrackClick = (track: Track) => {
    // TODO: Implement actual track playback
    console.log('Playing track:', track.title);
  };

  const handleFollowClick = async () => {
    if (!artist) return;
    
    try {
      if (artist.isFollowing) {
        await artistService.unfollowArtist(artist.id);
      } else {
        await artistService.followArtist(artist.id);
      }
      setArtist(prev => prev ? { ...prev, isFollowing: !prev.isFollowing } : null);
    } catch (err) {
      console.error('Failed to update follow status:', err);
    }
  };

  const handleSidebarItemSelect = (item: any) => {
    if (item.type === 'Artist') {
      setActiveItemId(item.id);
      router.push(`/artists/${item.id}`);
    } else if (item.type === 'Album') {
      setActiveItemId(item.id);
      router.push(`/albums/${item.id}`);
    } else if (item.type === 'Playlist') {
      setActiveItemId(item.id);
      router.push(`/playlists/${item.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-bg">
        <Sidebar activeTab="artists" />
        <main className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-[40vh] bg-gray-800 rounded-lg mb-8" />
            <div className="h-8 w-48 bg-gray-800 rounded mb-4" />
            <div className="h-4 w-96 bg-gray-800 rounded mb-8" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-800 rounded" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="flex min-h-screen bg-bg">
        <Sidebar activeTab="artists" />
        <main className="flex-1 p-8">
          <div className="text-red-500">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p>{error || 'Artist not found'}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar
        activeTab="artists"
        activeItemId={activeItemId as string}
        onItemSelect={handleSidebarItemSelect}
      />
      <main className="flex-1 overflow-y-auto">
        {/* Artist Header */}
        <div 
          className="relative h-[40vh] min-h-[400px] flex items-end p-8"
          style={{
            background: `linear-gradient(to bottom, rgba(0,0,0,0.3), var(--bg)), url(${artist.cover})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex items-end gap-6">
            <div className="w-48 h-48 rounded-full overflow-hidden shadow-lg">
              <img 
                src={artist.cover} 
                alt={artist.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-white">
              <h1 className="text-6xl font-bold mb-4">{artist.name}</h1>
              <p className="text-lg opacity-80">{artist.bio}</p>
              <div className="flex gap-6 mt-4">
                <div>
                  <span className="text-sm opacity-60">Monthly Listeners</span>
                  <p className="text-lg font-semibold">{artist.monthlyListeners}</p>
                </div>
                <div>
                  <span className="text-sm opacity-60">Followers</span>
                  <p className="text-lg font-semibold">{artist.followers}</p>
                </div>
              </div>
              <button
                onClick={handleFollowClick}
                className={`mt-6 px-8 py-3 rounded-full font-semibold transition-colors ${
                  artist.isFollowing
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                {artist.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Popular Tracks */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-text">Popular Tracks</h2>
            <TrackList 
              tracks={popularTracks}
              onTrackClick={handleTrackClick}
              showAlbum={true}
            />
          </section>

          {/* Albums */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-text">Albums</h2>
            <AlbumGrid 
              albums={albums}
              onAlbumClick={handleAlbumClick}
            />
          </section>
        </div>
      </main>
    </div>
  );
} 