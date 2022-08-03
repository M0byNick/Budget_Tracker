const CACHE_NAME = "BudgetTracker-V1.0"
const DATA_CACHE_NAME = "Data-Cache-V1.0"

const FILES_TO_CACHE = [
    './index.html',
    './css/styles.css',
    './js/index.js',
    './js/idb.js',
    './manifest.json',
    './icons/icon-512x512.png',
    './icons/icon-384x384.png',
    './icons/icon-192x192.png',
    './icons/icon-152x152.png',
    './icons/icon-144x144.png',
    './icons/icon-128x128.png',
    './icons/icon-96x96.png',
    './icons/icon-72x72.png'
];

self.addEventListener('install', function(i) {
    i.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Installing cache: " + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

self.addEventListener('activate', function(a) {
    a.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if(key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Deleting your old cache data", key);
                        return caches.delete(key);
                    };
                }),
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', function (f) {
    if(f.request.url.includes('/api')) {
        f.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(f.request).then(response => {
                    if(response.status === 200) {
                        cache.put(f.request.url, response.clone());
                    }
                    return response;
                }).catch(err => {
                    return cache.match(f.request);
                });
            }).catch(err => console.log(err))
        );

        return;
    }

    f.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(f.request).then(response => {
                return response || fetch(f.request);
            });
        })
    );
});