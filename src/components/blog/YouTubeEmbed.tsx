import React from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface YouTubeEmbedProps {
  videoId: string;
  className?: string;
  autoplay?: boolean;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoId, className = "", autoplay = false }) => {
  return (
    <div className={`w-full ${className}`}>
      <AspectRatio ratio={16 / 9}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-md"
        />
      </AspectRatio>
    </div>
  );
};

export default YouTubeEmbed;