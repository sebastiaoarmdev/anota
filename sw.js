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
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css",
    "https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"
];

self.addEventListener('install', (event) => {
    console.log('Installing Service worker...');
    event.waitUntil(
        caches.open(cacheName)
            .then((cache) => cache.addAll(precacheResources))
    );    
    console.log('Service worker installed!');
});

self.addEventListener('activate', (event) => {
    console.log('Service worker activated!');
});


self.addEventListener('fetch', (event) => {
    console.log('Fetch intercepted for:', event.request.url);
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        }),
    );
});
