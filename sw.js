const cacheName = 'cache';
const precacheResources = [
    "index.html",
    "styles/main.css",
    "scripts/app.js",
    "scripts/main.js",
    "images/32x32.png",
    "images/64x64.png",
    "images/128x128.png",
    "images/256x256.png",
    "images/favicon.ico",
    "libs/bootstrap-5.3.0-alpha1-dist/css/bootstrap.min.css",
    "libs/boxicons-2.1.4/css/boxicons.min.css",
    "libs/bootstrap-5.3.0-alpha1-dist/js/bootstrap.bundle.min.js"
];

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(cacheName)
            .then((cache) => cache.addAll(precacheResources))
    );    
    console.log('[Service Worker] Installed.');
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activated.');
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        (async () => {
            const response = await caches.match(event.request);
            console.log(`[Service Worker] Fetching resource: ${event.request.url}`);
            if (response) {
                return response;
            }
            response = await fetch(event.request);
            const cache = await caches.open(cacheName);
            console.log(`[Service Worker] Caching new resource: ${event.request.url}`);
            cache.put(event.request, response.clone());
            return response;
        })()
    );
});
