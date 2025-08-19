/**
 * Service Worker for Maturity Modeler
 * Provides offline capabilities and caching for better performance
 */

const CACHE_NAME = 'maturity-modeler-v1.0.0';
const CACHE_VERSION = '1.0.0';

// Files to cache for offline functionality
const CORE_CACHE_FILES = [
    '/',
    '/index.html',
    '/index-legacy.html',
    '/dist/main.bundle.js',
    '/dist/902.bundle.js',
    '/dist/main-built.css',
    '/dist/favicon.png',
    '/dist/images/maturity-model-placeholder.svg'
];

// Optional files that enhance experience but aren't critical
const OPTIONAL_CACHE_FILES = [
    '/dist/js/data/data_radar.js',
    '/dist/js/data/iac_radar.js'
];

// Install event - cache core files
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching core files...');
                return cache.addAll(CORE_CACHE_FILES);
            })
            .then(() => {
                // Try to cache optional files, but don't fail if they're not available
                return caches.open(CACHE_NAME)
                    .then(cache => {
                        return Promise.allSettled(
                            OPTIONAL_CACHE_FILES.map(file => cache.add(file))
                        );
                    });
            })
            .then(() => {
                console.log('Service Worker installed successfully');
                return self.skipWaiting(); // Activate immediately
            })
            .catch(error => {
                console.error('Service Worker installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim(); // Take control immediately
            })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip non-http requests
    if (!event.request.url.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // If we have a cached version, return it
                if (cachedResponse) {
                    console.log('Serving from cache:', event.request.url);
                    
                    // For HTML files, also try to update the cache in the background
                    if (event.request.url.endsWith('.html') || event.request.url.endsWith('/')) {
                        updateCacheInBackground(event.request);
                    }
                    
                    return cachedResponse;
                }
                
                // Otherwise, fetch from network
                console.log('Fetching from network:', event.request.url);
                return fetch(event.request)
                    .then(response => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response as it can only be consumed once
                        const responseToCache = response.clone();
                        
                        // Cache successful responses
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(error => {
                        console.error('Network request failed:', error);
                        
                        // For navigation requests, return a generic offline page
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html')
                                .then(fallback => {
                                    if (fallback) {
                                        return fallback;
                                    }
                                    // If even the fallback isn't cached, return a minimal offline page
                                    return new Response(`
                                        <!DOCTYPE html>
                                        <html>
                                        <head>
                                            <title>Offline - Maturity Modeler</title>
                                            <meta name="viewport" content="width=device-width, initial-scale=1">
                                            <style>
                                                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                                                .offline { color: #666; }
                                            </style>
                                        </head>
                                        <body>
                                            <h1>You're Offline</h1>
                                            <p class="offline">The Maturity Modeler application is not available offline right now.</p>
                                            <p>Please check your internet connection and try again.</p>
                                        </body>
                                        </html>
                                    `, {
                                        headers: { 'Content-Type': 'text/html' }
                                    });
                                });
                        }
                        
                        throw error;
                    });
            })
    );
});

/**
 * Update cache in background for stale-while-revalidate strategy
 */
function updateCacheInBackground(request) {
    fetch(request)
        .then(response => {
            if (response && response.status === 200 && response.type === 'basic') {
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(request, response);
                    });
            }
        })
        .catch(error => {
            console.log('Background update failed:', error);
        });
}

// Handle messages from the main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_UPDATE') {
        // Force update cache
        updateCacheInBackground(new Request(event.data.url));
    }
});

// Sync event for background synchronization
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('Background sync triggered');
        // Could be used for data synchronization in the future
    }
});

console.log('Service Worker loaded');