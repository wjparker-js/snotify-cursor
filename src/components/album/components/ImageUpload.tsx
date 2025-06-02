import React, { useRef } from 'react';
import { FormLabel } from "@/components/ui/form";
import { Upload, ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  imagePreview: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ imagePreview, handleFileChange, inputRef }) => {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fileInputEvent = {
        target: { files: e.dataTransfer.files } as any
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(fileInputEvent);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleBrowseClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-1/2">
        <FormLabel className="text-xs mb-2 block">Album Cover</FormLabel>
        <div
          className="flex items-center justify-center border-2 border-dashed border-gray-600 rounded-md w-40 h-32 relative overflow-hidden cursor-pointer bg-gray-900 hover:border-primary transition-colors"
          onClick={handleBrowseClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
            id="album-cover"
            tabIndex={-1}
          />
          <div className="flex flex-col items-center justify-center pointer-events-none select-none">
            <Upload className="w-6 h-6 text-gray-500" />
            <span className="mt-2 text-sm text-gray-500">Click or drag image here</span>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
        <span className="text-xs mb-1 block text-gray-400">Preview</span>
        {imagePreview ? (
          <div className="relative w-40 h-32 overflow-hidden rounded-md border border-gray-700 bg-gray-900">
            <img
              src={imagePreview}
              alt="Album preview"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-40 h-32 bg-gray-800 rounded-md border border-gray-700">
            <ImageIcon className="w-8 h-8 text-gray-400" />
            <span className="mt-2 text-xs text-gray-400">No image selected</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
