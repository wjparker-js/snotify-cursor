
import React from 'react';
import { ImagePlus } from 'lucide-react';

interface PlaylistImageUploadProps {
  imagePreview: string | null;
  setImageFile: (file: File | null) => void;
  setImagePreview: (preview: string | null) => void;
}

const PlaylistImageUpload: React.FC<PlaylistImageUploadProps> = ({ 
  imagePreview, 
  setImageFile, 
  setImagePreview 
}) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      setImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={`w-40 h-40 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer mb-2 overflow-hidden 
          ${imagePreview ? 'border-orange-700' : 'border-gray-600'}`}
        onClick={() => document.getElementById('playlist-image-upload')?.click()}
      >
        {imagePreview ? (
          <img 
            src={imagePreview} 
            alt="Playlist cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <ImagePlus size={32} />
            <span className="text-sm mt-2">Add cover image</span>
          </div>
        )}
      </div>
      
      <input
        id="playlist-image-upload"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
  );
};

export default PlaylistImageUpload;
