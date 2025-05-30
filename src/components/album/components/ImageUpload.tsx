
import React from 'react';
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Upload, ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  imagePreview: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ imagePreview, handleFileChange }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-1/2">
        <FormLabel className="text-xs mb-2 block">Album Cover</FormLabel>
        <div className="flex items-center justify-center border-2 border-dashed border-gray-600 rounded-md h-32 relative overflow-hidden">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
            id="album-cover"
          />
          <div className="flex flex-col items-center justify-center">
            <Upload className="w-6 h-6 text-gray-500" />
            <span className="mt-2 text-sm text-gray-500">Click to browse</span>
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 flex items-center justify-center">
        {imagePreview ? (
          <div className="relative w-32 h-32 overflow-hidden rounded-md">
            <img
              src={imagePreview}
              alt="Album preview"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-32 h-32 bg-gray-800 rounded-md">
            <ImageIcon className="w-8 h-8 text-gray-400" />
            <span className="mt-2 text-xs text-gray-400">No image selected</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
