// Mobile Performance Service Worker
// Caches essential face detection models for faster loading

const CACHE_NAME = 'relyselfie-models-v1';
const MODEL_FILES = [
  '/models/tiny_face_detector_model-shard1',
  '/models/tiny_face_detector_model-weights_manifest.json',
  '/models/face_landmark_68_tiny_model-shard1',
  '/models/face_landmark_68_tiny_model-weights_manifest.json'
];

// Install event - cache the models
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching face detection models for offline use');
        return cache.addAll(MODEL_FILES);
      })
      .then(() => {
        console.log('Models cached successfully');
        return self.skipWaiting();
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached models first
self.addEventListener('fetch', (event) => {
  // Only handle model file requests
  if (event.request.url.includes('/models/')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            console.log('Serving cached model:', event.request.url);
            return response;
          }
          
          console.log('Fetching model from network:', event.request.url);
          return fetch(event.request).then((response) => {
            // Cache the response for future use
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          });
        })
    );
  }
});
