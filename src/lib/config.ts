// API Configuration
const isDevelopment = import.meta.env.DEV;
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// If we're in development and accessing via localhost, use direct backend URL
// Otherwise, use relative paths to leverage Vite proxy
export const API_BASE_URL = (isDevelopment && isLocalhost) ? 'http://localhost:4000' : '';

// Uploads base URL for serving static files
export const UPLOADS_BASE_URL = (isDevelopment && isLocalhost) ? 'http://localhost:4000/uploads' : '/uploads';

// Helper function to get the full API URL
export const getApiUrl = (path: string): string => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

// Helper function to get the full uploads URL
export const getUploadsUrl = (path: string): string => {
  if (!path) return '';
  // If it's already a full URL, return as is
  if (/^https?:\/\//i.test(path)) return path;
  // Remove leading slashes and backslashes
  const cleanPath = path.replace(/^\/+|\\+/g, '');
  return `${UPLOADS_BASE_URL}/${cleanPath}`;
};

export default {
  API_BASE_URL,
  UPLOADS_BASE_URL,
  getApiUrl,
  getUploadsUrl
}; 