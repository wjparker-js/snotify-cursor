import React from 'react';
import { Link } from 'react-router-dom';
import { FeaturedBlogPostProps } from './types';
import { isYouTubeUrl, extractYouTubeVideoId } from '@/utils/youtubeUtils';
import YouTubeEmbed from '@/components/blog/YouTubeEmbed';

const FeaturedBlogPost = ({ article }: FeaturedBlogPostProps) => {
  const { title, subtitle, image_url, id, excerpt } = article;
  const isYouTube = image_url && isYouTubeUrl(image_url);
  const videoId = isYouTube ? extractYouTubeVideoId(image_url) : null;
  
  return (
    <div className="relative w-full aspect-[21/9] md:aspect-[21/7] rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
      <Link to={`/blog/${article.id}`}>
        {isYouTube && videoId ? (
          <div className="absolute inset-0">
            <YouTubeEmbed videoId={videoId} autoplay={true} className="h-full" />
          </div>
        ) : (
          <img
            src={image_url || '/placeholder.svg'}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6">
          <h3 className="text-2xl font-bold text-white line-clamp-2">{title}</h3>
          <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{subtitle || excerpt}</p>
        </div>
      </Link>
    </div>
  );
};

export default FeaturedBlogPost;