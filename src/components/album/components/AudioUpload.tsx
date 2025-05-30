
import React from 'react';
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Upload, FileAudio } from 'lucide-react';

interface AudioUploadProps {
  audioFile: File | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AudioUpload: React.FC<AudioUploadProps> = ({ audioFile, handleFileChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <FormLabel className="text-xs">Audio File (MP3 or M4A)</FormLabel>
      <div className="mt-1 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-md h-24">
        <Input
          type="file"
          accept=".mp3,.m4a"
          onChange={handleFileChange}
          className="hidden"
          id="track-audio"
        />
        <label
          htmlFor="track-audio"
          className="flex flex-col items-center justify-center cursor-pointer w-full h-full"
        >
          <Upload className="w-5 h-5 text-gray-500" />
          <span className="mt-1 text-xs text-gray-500">Click to browse</span>
        </label>
      </div>

      {audioFile && (
        <div className="flex items-center gap-2 px-2 py-1 bg-zinc-800 rounded mt-2">
          <FileAudio className="w-4 h-4 text-gray-400" />
          <span className="text-xs truncate">{audioFile.name}</span>
        </div>
      )}
    </div>
  );
};

export default AudioUpload;
