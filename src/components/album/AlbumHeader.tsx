import React from 'react';
import { Play, Shuffle, Heart, MoreHorizontal, Download } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const getAlbumImageUrl = (image_url: string | null | undefined) => {
  if (!image_url) return '/placeholder.svg';
  return image_url;
};

interface AlbumHeaderProps {
  image: string;
  title: string;
  artist: string;
  year: string;
  trackCount: string;
  duration: string;
  actions?: React.ReactNode;
}
const AlbumHeader: React.FC<AlbumHeaderProps> = ({
  image,
  title,
  artist,
  year,
  trackCount,
  duration,
  actions
}) => {
  const isMobile = useIsMobile(768);
  const imageUrl = getAlbumImageUrl(image);

  return <div className="bg-gradient-to-b from-zinc-700/40 to-spotify-background p-2 md:p-3 w-full px-0 relative">
      {isMobile ?
    // Mobile layout - everything centered properly with reduced height
    <div className="w-full flex flex-col items-center text-center">
          {actions && <div className="w-full flex justify-end mb-2">{actions}</div>}
          <h1 className="text-xl sm:text-2xl font-bold mb-1">{title}</h1>
          {/* Center the album art properly with reduced dimensions */}
          <div className="flex justify-center w-full mb-1">
            <div className="flex justify-center items-center" style={{ width: 145, height: 145 }}>
              <img src={imageUrl} alt={title} className="shadow-xl object-cover rounded-md" style={{ width: 145, height: 145, maxWidth: '100%', maxHeight: '100%' }} />
            </div>
          </div>
          <div className="w-full flex flex-col items-center mt-1 gap-1">
            <div className="flex items-center gap-1 text-xs">
              <img src={imageUrl} alt={artist} className="w-4 h-4 rounded-full object-cover" />
              <span className="font-medium hover:underline cursor-pointer">{artist}</span>
              {year && <>
                  <span className="text-spotify-text-secondary mx-1">•</span>
                  <span className="text-spotify-text-secondary">{year}</span>
                </>}
              {trackCount && <>
                  <span className="text-spotify-text-secondary mx-1">•</span>
                  <span className="text-spotify-text-secondary">{trackCount}</span>
                </>}
              {duration && <>
                  <span className="text-spotify-text-secondary mx-1">•</span>
                  <span className="text-spotify-text-secondary">{duration}</span>
                </>}
            </div>
          </div>
        </div> :
    // Desktop layout - horizontal alignment with reduced height
    <div className="flex items-center gap-3 py-[10px] px-[10px] relative">
          <div className="flex justify-center items-center" style={{ width: 145, height: 145 }}>
            <img src={imageUrl} alt={title} className="shadow-xl object-cover rounded-md" style={{ width: 145, height: 145, maxWidth: '100%', maxHeight: '100%' }} />
          </div>
          <div className="flex flex-col gap-0">
            <span className="text-xs font-medium">Album</span>
            <h1 className="text-lg sm:text-xl font-bold">{title}</h1>
            <div className="flex items-center gap-1 text-xs">
              <img src={imageUrl} alt={artist} className="w-4 h-4 rounded-full object-cover" />
              <span className="font-medium hover:underline cursor-pointer">{artist}</span>
              {year && <>
                  <span className="text-spotify-text-secondary mx-1">•</span>
                  <span className="text-spotify-text-secondary">{year}</span>
                </>}
              {trackCount && <>
                  <span className="text-spotify-text-secondary mx-1">•</span>
                  <span className="text-spotify-text-secondary">{trackCount}</span>
                </>}
              {duration && <>
                  <span className="text-spotify-text-secondary mx-1">•</span>
                  <span className="text-spotify-text-secondary">{duration}</span>
                </>}
            </div>
          </div>
          {actions && <div className="absolute top-0 right-0 flex gap-2">{actions}</div>}
        </div>}
    </div>;
};
export default AlbumHeader;