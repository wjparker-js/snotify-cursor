import { useState, useEffect, useRef } from 'react';

interface CacheEntry {
  url: string;
  blob: Blob;
  objectUrl: string;
  timestamp: number;
}

class ImageCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100; // Maximum number of images to cache
  private maxAge = 30 * 60 * 1000; // 30 minutes in milliseconds

  async get(url: string): Promise<string | null> {
    const entry = this.cache.get(url);
    
    if (entry) {
      // Check if cache entry is still valid
      if (Date.now() - entry.timestamp < this.maxAge) {
        // Update access time for LRU behavior
        entry.timestamp = Date.now();
        return entry.objectUrl;
      } else {
        // Clean up expired entry
        URL.revokeObjectURL(entry.objectUrl);
        this.cache.delete(url);
      }
    }
    
    return null;
  }

  async set(url: string, blob: Blob): Promise<string> {
    // Clean up old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    const objectUrl = URL.createObjectURL(blob);
    const entry: CacheEntry = {
      url,
      blob,
      objectUrl,
      timestamp: Date.now()
    };

    this.cache.set(url, entry);
    return objectUrl;
  }

  private cleanup() {
    // Remove oldest entries first
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 20% of entries
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      const [key, entry] = entries[i];
      URL.revokeObjectURL(entry.objectUrl);
      this.cache.delete(key);
    }
  }

  clear() {
    this.cache.forEach(entry => {
      URL.revokeObjectURL(entry.objectUrl);
    });
    this.cache.clear();
  }
}

// Global cache instance
const imageCache = new ImageCache();

export function useImageCache(url: string | null | undefined, fallback: string = '/placeholder.svg') {
  const [imageUrl, setImageUrl] = useState<string>(fallback);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!url || url === fallback) {
      setImageUrl(fallback);
      setIsLoading(false);
      setError(null);
      return;
    }

    const loadImage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Cancel any previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Check cache first
        const cachedUrl = await imageCache.get(url);
        if (cachedUrl) {
          setImageUrl(cachedUrl);
          setIsLoading(false);
          return;
        }

        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();

        // Fetch image
        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.status}`);
        }

        const blob = await response.blob();
        
        // Cache the image and get object URL
        const objectUrl = await imageCache.set(url, blob);
        setImageUrl(objectUrl);
        setIsLoading(false);

      } catch (err: any) {
        if (err.name === 'AbortError') {
          return; // Request was cancelled, don't update state
        }
        
        console.error('Failed to load image:', err);
        setError(err.message);
        setImageUrl(fallback);
        setIsLoading(false);
      }
    };

    loadImage();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, fallback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { imageUrl, isLoading, error };
}

// Export cache instance for manual cache management if needed
export { imageCache }; 