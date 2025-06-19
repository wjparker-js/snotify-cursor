import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if a string is a valid URL
 * @param str String to validate as URL
 * @returns boolean indicating if the string is a valid URL
 */
export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Convert plain text links in content to anchor tags
 * @param text Text with URLs
 * @returns Text with URLs converted to <a> tags
 */
export function linkifyText(text: string): string {
  if (!text) return '';
  
  // Regex to find URLs not already in HTML tags
  const urlRegex = /(?<!["'=])(https?:\/\/[^\s<]+)(?![^<]*>|[^<>]*<\/)/g;
  
  return text.replace(urlRegex, url => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">${url}</a>`;
  });
}
