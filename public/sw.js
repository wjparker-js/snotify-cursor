const CACHE_NAME = 'snotify-cache-v1';
const API_CACHE_NAME = 'snotify-api-cache-v1';

// Cache API responses for album/playlist covers and metadata
const API_CACHE_PATTERNS = [
  /\/api\/albums\/\d+\/cover/,
  /\/api\/playlists\/\d+\/cover/,
  /\/api\/albums$/,
  /\/api\/playlists$/
];

// Cache static assets
const STATIC_CACHE_PATTERNS = [
  /\.(jpg|jpeg|png|gif|webp|ico)$/,
  /\.(mp3|wav|flac|m4a|ogg)$/,
  /\/placeholder\.svg$/
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only cache GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Check if this is an API request we want to cache
  const isApiRequest = API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
  
  // Check if this is a static asset we want to cache
  const isStaticAsset = STATIC_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));

  if (isApiRequest) {
    event.respondWith(handleApiRequest(request));
  } else if (isStaticAsset) {
    event.respondWith(handleStaticAsset(request));
  }
});

async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Try network first for API requests
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Clone the response before caching
      const responseClone = networkResponse.clone();
      
      // Cache successful responses
      cache.put(request, responseClone);
      
      return networkResponse;
    }
    
    throw new Error('Network response was not ok');
  } catch (error) {
    console.log('Network failed, trying cache for:', request.url);
    
    // If network fails, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cache, return a placeholder for images
    if (request.url.includes('/cover')) {
      return new Response('', { status: 404 });
    }
    
    throw error;
  }
}

async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Try cache first for static assets
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
      
      return networkResponse;
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Failed to fetch static asset:', request.url);
    throw error;
  }
} 