
import React from 'react';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface FeaturedCardProps {
  image: string;
  title: string;
  description: string;
  type: string;
  id?: string;
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({
  image,
  title,
  description,
  type,
  id,
}) => {
  const renderContent = () => (
    <div className="flex flex-col md:flex-row items-stretch bg-black rounded-lg overflow-hidden relative cursor-pointer group">
      <div className="w-full md:w-2/3 p-6 flex flex-col justify-between z-10">
        <div>
          <span className="text-xs text-white bg-black/40 px-2 py-1 rounded">
            {type}
          </span>
          <h2 className="text-2xl md:text-4xl font-bold mt-4 mb-2">{title}</h2>
          <p className="text-sm text-spotify-text-secondary">{description}</p>
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <button className="bg-spotify-accent text-black rounded-full py-2 md:py-3 px-6 md:px-8 font-bold hover:scale-105 transition">
            Play
          </button>
          <button className="border border-white/30 text-white rounded-full py-2 md:py-3 px-6 md:px-8 font-bold hover:border-white transition">
            Follow
          </button>
        </div>
      </div>
      
      <div className="w-full md:w-2/5 h-48 md:h-auto relative">
        <AspectRatio ratio={1/1} className="h-full">
          <img 
            src={image} 
            alt={title} 
            className="h-full w-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent md:block hidden"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent md:hidden"></div>
        </AspectRatio>
      </div>
    </div>
  );

  // If we have an ID, wrap the content in a Link
  if (id) {
    return (
      <Link to={`/album/${id}`} className="block">
        {renderContent()}
      </Link>
    );
  }

  return renderContent();
};

export default FeaturedCard;
