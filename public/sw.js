// Service Worker for NovateScribe Frontend
const CACHE_NAME = 'novatescribe-v1'
const STATIC_CACHE = 'novatescribe-static-v1'
const DYNAMIC_CACHE = 'novatescribe-dynamic-v1'

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/register',
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/main.js',
  '/manifest.json'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  // console.log('Service Worker installing...')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        // console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  // console.log('Service Worker activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            // console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event
  
  // Skip non-GET requests
  if (request.method !== 'GET') return
  
  // Skip API requests for dynamic content
  if (request.url.includes('/api/')) return
  
  // Handle static assets
  if (request.url.includes('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          const responseClone = fetchResponse.clone()
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
          return fetchResponse
        })
      })
    )
    return
  }
  
  // Handle page requests with network-first strategy
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(request).then((response) => {
          return response || caches.match('/')
        })
      })
  )
})

// Background sync for offline uploads (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    // console.log('Background sync triggered')
    // Handle offline upload queue here
  }
})

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('NovateScribe', options)
  )
}) 