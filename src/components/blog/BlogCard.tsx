import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { BlogCardProps } from './types';
import { isYouTubeUrl, extractYouTubeVideoId } from '@/utils/youtubeUtils';
import YouTubeEmbed from '@/components/blog/YouTubeEmbed';

const BlogCard = ({ article }: BlogCardProps) => {
  const { title, subtitle, image_url, excerpt } = article;
  const isYouTube = image_url && isYouTubeUrl(image_url);
  const videoId = isYouTube ? extractYouTubeVideoId(image_url) : null;
  
  return (
    <Card className="overflow-hidden bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer w-[300px]">
      <Link to={`/blog/${article.id}`}>
        <div className="relative">
          <div className="w-[300px] h-[300px]">
            {isYouTube && videoId ? (
              <YouTubeEmbed videoId={videoId} autoplay={false} />
            ) : (
              <img
                src={image_url || '/placeholder.svg'}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium line-clamp-1">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {subtitle || excerpt}
            </p>
          </CardContent>
        </div>
      </Link>
    </Card>
  );
};

export default BlogCard;