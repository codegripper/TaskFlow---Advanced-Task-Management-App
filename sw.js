/**
 * TaskFlow Service Worker
 * Provides offline functionality and caching
 */

const CACHE_NAME = 'taskflow-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/app.css',
    '/css/demo.css',
    '/css/ef-tabs.css',
    '/css/ef-tabs-light-green.css',
    '/css/font-awesome.min.css',
    '/js/app.js',
    '/js/api.js',
    '/js/storage.js',
    '/js/ef-tabs.js',
    '/js/jquery.transit.js',
    '/manifest.json',
    'https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.js',
    'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
    console.log('[ServiceWorker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[ServiceWorker] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.log('[ServiceWorker] Cache failed:', err);
            })
    );
    
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[ServiceWorker] Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Claim control of all clients
    return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip chrome extension requests
    if (event.request.url.startsWith('chrome-extension://')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    console.log('[ServiceWorker] Serving from cache:', event.request.url);
                    return response;
                }
                
                // Clone the request
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest)
                    .then(response => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response
                        const responseToCache = response.clone();
                        
                        // Cache the fetched response
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(err => {
                        console.log('[ServiceWorker] Fetch failed:', err);
                        
                        // Return offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        
                        throw err;
                    });
            })
    );
});

// Background sync for offline tasks
self.addEventListener('sync', event => {
    console.log('[ServiceWorker] Background sync:', event.tag);
    
    if (event.tag === 'sync-tasks') {
        event.waitUntil(syncTasks());
    }
});

async function syncTasks() {
    try {
        // Get pending sync data from IndexedDB or localStorage
        const syncData = await getSyncData();
        
        if (syncData && syncData.length > 0) {
            // Send data to server
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(syncData)
            });
            
            if (response.ok) {
                // Clear sync queue
                await clearSyncData();
                console.log('[ServiceWorker] Sync successful');
                
                // Notify all clients
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage({
                            type: 'SYNC_COMPLETE',
                            success: true
                        });
                    });
                });
            }
        }
    } catch (error) {
        console.error('[ServiceWorker] Sync failed:', error);
        throw error;
    }
}

// Helper functions for sync data
async function getSyncData() {
    // In a real app, retrieve from IndexedDB
    return [];
}

async function clearSyncData() {
    // In a real app, clear IndexedDB sync queue
    return true;
}

// Push notification handler
self.addEventListener('push', event => {
    console.log('[ServiceWorker] Push received');
    
    let data = {
        title: 'TaskFlow',
        body: 'You have a new notification',
        icon: '/icon-192.png',
        badge: '/badge-72.png'
    };
    
    if (event.data) {
        data = event.data.json();
    }
    
    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'view',
                title: 'View',
                icon: '/icons/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icons/close.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    console.log('[ServiceWorker] Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handler for communication with main app
self.addEventListener('message', event => {
    console.log('[ServiceWorker] Message received:', event.data);
    
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then(cache => cache.addAll(event.data.urls))
        );
    }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-tasks') {
        event.waitUntil(updateTasksInBackground());
    }
});

async function updateTasksInBackground() {
    try {
        const response = await fetch('/api/tasks/updates');
        const updates = await response.json();
        
        // Notify clients about updates
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'TASKS_UPDATED',
                    data: updates
                });
            });
        });
    } catch (error) {
        console.error('[ServiceWorker] Background update failed:', error);
    }
}
