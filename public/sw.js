const CACHE_NAME = 'dil2deal-v2';
const STATIC_CACHE_NAME = 'dil2deal-static-v2';

const STATIC_ASSETS = [
  '/',
  '/deals',
  '/vendor',
  '/api/categories',
  '/api/locations/states'
];

// Only cache deals API. Do NOT cache location APIs to avoid stale filters
const API_CACHE_PATTERNS = [
  /\/api\/deals/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with caching (deals only). Always bypass cache when t= or no-store requested
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    const bypass = url.searchParams.has('t') || request.headers.get('Cache-Control') === 'no-store';
    if (bypass) {
      event.respondWith(fetch(request));
      return;
    }
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            // Return cached response if available
            return response;
          }

          // Fetch from network and cache
          return fetch(request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Return cached response if network fails
            return cache.match(request);
          });
        });
      })
    );
    return;
  }

  // Handle static assets
  if (request.method === 'GET' && request.destination !== 'document') {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request);
      })
    );
    return;
  }

  // For other requests, try network first
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic here
  console.log('Background sync triggered');
} 