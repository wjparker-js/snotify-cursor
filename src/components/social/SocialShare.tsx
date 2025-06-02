import { useState } from 'react';
import { Twitter, Facebook, Instagram, Share2, Link } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ShareData {
  title: string;
  description?: string;
  url: string;
  image?: string;
  type: 'track' | 'playlist' | 'profile';
}

interface SocialShareProps {
  data: ShareData;
  className?: string;
}

export function SocialShare({ data, className }: SocialShareProps) {
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

  const generateShareUrl = (platform: string) => {
    const baseUrl = window.location.origin;
    const shareUrl = encodeURIComponent(`${baseUrl}${data.url}`);
    const shareTitle = encodeURIComponent(data.title);
    const shareDescription = data.description ? encodeURIComponent(data.description) : '';

    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
      case 'instagram':
        return `${baseUrl}/api/share/instagram-story?data=${encodeURIComponent(JSON.stringify(data))}`;
      default:
        return shareUrl;
    }
  };

  const handleShare = async (platform: string) => {
    const shareUrl = generateShareUrl(platform);

    if (platform === 'instagram') {
      setIsGeneratingStory(true);
      try {
        const response = await fetch(shareUrl);
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        // Open Instagram story creation
        window.open('instagram-stories://share', '_blank');
        
        // Copy image to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        
        toast.success('Story image copied to clipboard! Paste it in Instagram Stories.');
      } catch (error) {
        toast.error('Failed to generate Instagram story');
      } finally {
        setIsGeneratingStory(false);
      }
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${data.url}`);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={className}
        disabled={isGeneratingStory}
      >
        <Share2 className="w-5 h-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleShare('twitter')}>
          <Twitter className="w-4 h-4 mr-2" />
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('facebook')}>
          <Facebook className="w-4 h-4 mr-2" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('instagram')}>
          <Instagram className="w-4 h-4 mr-2" />
          {isGeneratingStory ? 'Generating Story...' : 'Share to Instagram Story'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard}>
          <Link className="w-4 h-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 