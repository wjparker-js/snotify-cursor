
import React, { useState } from 'react';
import { Camera, Loader2, Youtube } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { extractYouTubeVideoId, getYouTubeThumbnailUrl, isYouTubeUrl } from '@/utils/youtubeUtils';
import { useToast } from '@/hooks/use-toast';

interface ArticleImageUploadProps {
  imagePreview?: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading?: boolean;
  onYoutubeUrlSubmit?: (thumbnailUrl: string, videoId: string) => void;
}

const ArticleImageUpload: React.FC<ArticleImageUploadProps> = ({
  imagePreview,
  handleFileChange,
  isLoading = false,
  onYoutubeUrlSubmit
}) => {
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleYoutubeSubmit = () => {
    if (!youtubeUrl.trim() || !onYoutubeUrlSubmit) return;
    
    setIsValidating(true);
    
    try {
      // Check if it's a valid YouTube URL
      if (!isYouTubeUrl(youtubeUrl)) {
        toast({
          title: "Invalid YouTube URL",
          description: "Please enter a valid YouTube video URL",
          variant: "destructive"
        });
        setIsValidating(false);
        return;
      }
      
      // Extract video ID
      const videoId = extractYouTubeVideoId(youtubeUrl);
      
      if (!videoId) {
        toast({
          title: "Invalid YouTube URL",
          description: "Could not extract video ID from the URL",
          variant: "destructive"
        });
        setIsValidating(false);
        return;
      }
      
      // Get the thumbnail URL
      const thumbnailUrl = getYouTubeThumbnailUrl(videoId);
      
      // Call the callback with the thumbnail URL and video ID
      onYoutubeUrlSubmit(thumbnailUrl, videoId);
      
      // Hide YouTube input
      setShowYoutubeInput(false);
      setYoutubeUrl('');
      
      toast({
        title: "YouTube thumbnail added",
        description: "The video thumbnail has been set as the article image"
      });
    } catch (error) {
      console.error("Error processing YouTube URL:", error);
      toast({
        title: "Error",
        description: "Failed to process the YouTube URL",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full h-[200px] mb-2 border-2 border-dashed border-gray-300 rounded-md overflow-hidden flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
        {isLoading ? (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : null}
        
        {imagePreview ? (
          <img 
            src={imagePreview} 
            alt="Article preview" 
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Failed to load image preview");
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        ) : (
          <div className="text-center p-4">
            <Camera className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Click to upload featured image</p>
            <p className="text-xs text-gray-500">(Max size: 5MB)</p>
          </div>
        )}

        <input 
          type="file" 
          className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={handleFileChange}
          accept="image/*"
          disabled={isLoading || showYoutubeInput}
        />
      </div>
      
      {onYoutubeUrlSubmit && (
        <>
          {showYoutubeInput ? (
            <div className="flex w-full mt-2 mb-4 gap-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Paste YouTube URL (e.g., https://youtube.com/watch?v=...)"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button 
                onClick={handleYoutubeSubmit} 
                disabled={isValidating || !youtubeUrl.trim()}
                size="sm"
              >
                {isValidating ? <Spinner size="sm" className="mr-2" /> : null}
                Add
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowYoutubeInput(false)}
                disabled={isValidating}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 flex items-center gap-1"
              onClick={() => setShowYoutubeInput(true)}
              type="button"
            >
              <Youtube size={16} /> Use YouTube Thumbnail
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default ArticleImageUpload;
