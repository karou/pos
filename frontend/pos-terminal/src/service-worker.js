/* eslint-disable no-restricted-globals */
// Service Worker for POS Terminal - Offline Capability
const CACHE_NAME = 'pos-terminal-cache-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache initially
const filesToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/static/media/logo.png'
];

// Install event - cache the essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(filesToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, then network with cache update
self.addEventListener('fetch', (event) => {
  // Skip for non-GET requests and browser extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  // Handle API requests
  if (event.request.url.includes('/api/')) {
    return handleApiRequest(event);
  }
  
  // Handle static assets and navigation requests
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached response and update cache in background
          fetchAndUpdateCache(event.request);
          return cachedResponse;
        }
        
        // If not in cache, fetch from network
        return fetchAndUpdateCache(event.request)
          .catch(() => {
            // If offline and requesting a page, show offline page
            if (event.request.headers.get('Accept').includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
            return null;
          });
      })
  );
});

// Function to fetch and update cache
function fetchAndUpdateCache(request) {
  return fetch(request)
    .then((response) => {
      // Check if valid response
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }
      
      // Clone the response - one to cache, one to return
      const responseToCache = response.clone();
      
      caches.open(CACHE_NAME)
        .then((cache) => {
          cache.put(request, responseToCache);
        });
        
      return response;
    });
}

// Function to handle API requests
function handleApiRequest(event) {
  // Try to fetch from network first
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.log('Service Worker: Fetch failed, processing offline', error);
        
        // If network request fails, send to IndexedDB for processing
        return sendToIndexedDB(event.request.clone())
          .then(() => {
            // Return a custom response indicating offline processing
            return new Response(
              JSON.stringify({ 
                success: true,
                offline: true,
                message: 'Request saved for processing when online' 
              }),
              { 
                headers: { 'Content-Type': 'application/json' } 
              }
            );
          });
      })
  );
}

// Function to store API request in IndexedDB for later processing
function sendToIndexedDB(request) {
  return request.json()
    .then((body) => {
      return new Promise((resolve, reject) => {
        // Open IndexedDB
        const dbPromise = indexedDB.open('PosOfflineDB', 1);
        
        dbPromise.onupgradeneeded = (event) => {
          const db = event.target.result;
          
          // Create object store for pending requests if it doesn't exist
          if (!db.objectStoreNames.contains('pendingRequests')) {
            db.createObjectStore('pendingRequests', { keyPath: 'id', autoIncrement: true });
          }
        };
        
        dbPromise.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction('pendingRequests', 'readwrite');
          const store = transaction.objectStore('pendingRequests');
          
          // Store request details
          const requestData = {
            url: request.url,
            method: request.method,
            headers: Array.from(request.headers.entries()),
            body,
            timestamp: Date.now()
          };
          
          const storeRequest = store.add(requestData);
          
          storeRequest.onsuccess = () => {
            console.log('Service Worker: Request saved to IndexedDB');
            resolve();
          };
          
          storeRequest.onerror = (error) => {
            console.error('Service Worker: Error saving request to IndexedDB', error);
            reject(error);
          };
          
          transaction.oncomplete = () => {
            db.close();
          };
        };
        
        dbPromise.onerror = (error) => {
          console.error('Service Worker: IndexedDB error', error);
          reject(error);
        };
      });
    });
}

// Sync event - process pending requests when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-requests') {
    event.waitUntil(processPendingRequests());
  }
});

// Function to process pending requests from IndexedDB
function processPendingRequests() {
  return new Promise((resolve, reject) => {
    const dbPromise = indexedDB.open('PosOfflineDB', 1);
    
    dbPromise.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction('pendingRequests', 'readwrite');
      const store = transaction.objectStore('pendingRequests');
      
      const getAll = store.getAll();
      
      getAll.onsuccess = () => {
        const requests = getAll.result;
        
        // Process each request
        Promise.all(requests.map((request) => {
          return fetch(request.url, {
            method: request.method,
            headers: new Headers(request.headers),
            body: JSON.stringify(request.body)
          })
          .then((response) => {
            if (response.ok) {
              // If successful, remove from pending
              store.delete(request.id);
              return true;
            }
            return false;
          })
          .catch((error) => {
            console.error('Error processing pending request:', error);
            return false;
          });
        }))
        .then(() => {
          console.log('Service Worker: Pending requests processed');
          resolve();
        })
        .catch((error) => {
          console.error('Service Worker: Error processing pending requests', error);
          reject(error);
        });
      };
      
      getAll.onerror = (error) => {
        console.error('Service Worker: Error retrieving pending requests', error);
        reject(error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
    
    dbPromise.onerror = (error) => {
      console.error('Service Worker: IndexedDB error', error);
      reject(error);
    };
  });
}