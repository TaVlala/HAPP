// HAPP — Service Worker
// Caches all app shell files for offline use
// Strategy: Cache First for static assets, Network First for Firebase

const CACHE_NAME    = 'happ-v5';
const CACHE_VERSION = 5;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/js/app.js',
  '/js/router.js',
  '/firebase/firebase.js',
  '/services/encryptionService.js',
  '/services/storageService.js',
  '/services/complianceService.js',
  '/data/supplements.js',
  '/modules/dashboardModule.js',
  '/modules/supplementsModule.js',
  '/modules/measurementsModule.js',
  '/modules/archiveModule.js',
  '/ui/sidebar.js',
  '/ui/cards.js',
  '/ui/charts.js',
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
];

// Install — cache all static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })))
        .catch(err => console.warn('[SW] Some assets failed to cache:', err));
    }).then(() => self.skipWaiting())
  );
});

// Activate — clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — Cache First for static, passthrough for Firebase/Firestore
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Ignore non-http(s) requests (e.g. chrome-extension://)
  if (!url.startsWith('http')) return;

  // Let Firebase/Firestore requests pass through to network always
  if (url.includes('firestore.googleapis.com') ||
      url.includes('firebase.googleapis.com') ||
      url.includes('identitytoolkit.googleapis.com')) {
    return; // network only
  }

  // Cache first strategy for everything else
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache valid responses
        if (response && response.status === 200 && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
