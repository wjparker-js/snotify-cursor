/**
 * Utility functions for working with YouTube videos
 */

// Regular expression to match YouTube URLs
const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

/**
 * Extract YouTube video ID from a URL string
 * @param url YouTube URL
 * @returns YouTube video ID or null if not a valid YouTube URL
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  const match = url.match(YOUTUBE_REGEX);
  return match ? match[1] : null;
};

/**
 * Get YouTube thumbnail URL from a video ID
 * @param videoId YouTube video ID
 * @returns URL to the YouTube video thumbnail (high quality)
 */
export const getYouTubeThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

/**
 * Check if a URL is a YouTube video URL
 * @param url URL to check
 * @returns boolean indicating if the URL is a YouTube video
 */
export const isYouTubeUrl = (url: string): boolean => {
  if (!url) return false;
  return YOUTUBE_REGEX.test(url);
};

/**
 * Generate a YouTube embed HTML for the editor
 * @param videoId YouTube video ID
 * @returns HTML string for embedded YouTube player that will be replaced with actual iframe
 */
export const createYouTubeEmbed = (videoId: string): string => {
  return `<div class="youtube-embed" data-youtube-id="${videoId}"></div>`;
};

/**
 * Generate an embeddable YouTube iframe HTML
 * @param videoId YouTube video ID
 * @returns HTML string with YouTube iframe placeholder
 */
export const generateYouTubeEmbed = (videoId: string): string => {
  return createYouTubeEmbed(videoId);
};

/**
 * Convert YouTube URLs in text to embedded videos
 * This can be used to process content before saving
 * @param content Text content that might contain YouTube URLs
 * @returns Content with YouTube URLs converted to embeds
 */
export const convertYouTubeUrlsToEmbeds = (content: string): string => {
  if (!content) return content;
  
  // Find YouTube URLs and replace them with embeds
  return content.replace(YOUTUBE_REGEX, (match, videoId) => {
    return createYouTubeEmbed(videoId);
  });
};

/**
 * Check if content is just a URL and nothing else
 * @param content The content to check
 * @returns boolean indicating if content is just a URL
 */
export const isContentOnlyUrl = (content: string): boolean => {
  if (!content) return false;
  
  // Trim whitespace and check if it matches a URL pattern
  const trimmed = content.trim();
  const urlPattern = /^(https?:\/\/)[^\s]+$/;
  
  return urlPattern.test(trimmed);
};