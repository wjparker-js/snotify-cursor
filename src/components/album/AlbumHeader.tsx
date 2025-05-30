import React from 'react';
import { Play, Shuffle, Heart, MoreHorizontal, Download } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const getAlbumImageUrl = (image_url: string | null | undefined) => {
  if (!image_url) return '/placeholder.svg';
  if (/^https?:\/\//i.test(image_url)) return image_url;
  return `http://localhost:4000/uploads/${image_url.replace(/^\/+|\\/g, '/')}`;
};

interface AlbumHeaderProps {
  image: string;
  title: string;
  artist: string;
  year: string;
  trackCount: string;
  duration: string;
}
const AlbumHeader: React.FC<AlbumHeaderProps> = ({
  image,
  title,
  artist,
  year,
  trackCount,
  duration
}) => {
  const isMobile = useIsMobile(768);
  const imageUrl = getAlbumImageUrl(image);

  return <div className="bg-gradient-to-b from-zinc-700/40 to-spotify-background p-2 md:p-3 w-full px-0">
      {isMobile ?
    // Mobile layout - everything centered properly with reduced height
    <div className="w-full flex flex-col items-center text-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-1">{title}</h1>
          
          {/* Center the album art properly with reduced dimensions */}
          <div className="flex justify-center w-full mb-1">
            <div className="w-[100px] h-[100px] flex justify-center items-center">
              <img src={imageUrl} alt={title} className="w-full h-full shadow-xl object-cover" />
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
    <div className="flex items-center gap-3 py-[10px] px-[10px]">
          <div>
            <img src={imageUrl} alt={title} className="w-24 h-auto shadow-xl object-cover  " />
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
        </div>}
    </div>;
};
export default AlbumHeader;