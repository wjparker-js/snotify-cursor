import Image from 'next/image';
import { Music } from 'lucide-react';

interface Artist {
  id: string;
  name: string;
  image: string;
  playCount: number;
}

interface TopArtistsProps {
  artists: Artist[];
}

export default function TopArtists({ artists }: TopArtistsProps) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Top Artists</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {artists.map((artist) => (
          <div
            key={artist.id}
            className="group relative aspect-square rounded-lg overflow-hidden bg-gray-900"
          >
            {artist.image ? (
              <Image
                src={artist.image}
                alt={artist.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <Music className="w-8 h-8 text-gray-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
              <h4 className="text-white font-medium truncate">{artist.name}</h4>
              <p className="text-gray-300 text-sm">
                {artist.playCount} plays
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 