'use strict';

const VERSION = '202304010248';
const RESOURCES = [
    './',
    './index.html',
    './styles/main.css',
    './scripts/app.js',
    './scripts/main.js',
    './images/32x32.png',
    './images/64x64.png',
    './images/128x128.png',
    './images/192x192.png',
    './images/256x256.png',
    './images/512x512.png',
    './images/favicon.ico',
    './libs/bootstrap-5.3.0-alpha1-dist/css/bootstrap.min.css',
    './libs/boxicons-2.1.4/css/boxicons.min.css',
    './libs/bootstrap-5.3.0-alpha1-dist/js/bootstrap.bundle.min.js'
];

const addResourcesToCache = async (resources) => {
    const cache = await caches.open(VERSION);
    await cache.addAll(resources);
};

const putInCache = async (request, response) => {
    const cache = await caches.open(VERSION);
    await cache.put(request, response);
};

const cacheFirst = async ({
    request, 
    preloadResponsePromise, 
    fallbackURL
}) => {
    const responseFromCache = await caches.match(request);
    if (responseFromCache) return responseFromCache;
    
    const preloadResponse = await preloadResponsePromise;
    if (preloadResponse) {
        console.log('[Service Worker] Using preload response', preloadResponse);
        putInCache(request, preloadResponse.clone());
        return preloadResponse;
    }

    try {
        const responseFromNetwork = await fetch(request);
        putInCache(request, responseFromNetwork.clone());
        return responseFromNetwork;
    } catch (error) {
        const fallbackResponse = await caches.match(fallbackURL);
        if (fallbackResponse) return fallbackResponse;
        return new Response('[Service Worker] Network error!', {
            status: 408,
            headers: {'Content-Type': 'text/plain'},
        });
    }
};

const enableNavigationPreload = async () => {
    if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
    }
};

const deleteCache = async (key) => {
    await caches.delete(key);
};
  
const deleteOldCaches = async () => {
    const cacheKeepList = [VERSION];
    const keyList = await caches.keys();
    const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key));
    await Promise.all(cachesToDelete.map(deleteCache));
};

self.addEventListener('activate', (event) => {
    event.waitUntil(enableNavigationPreload());
});
  
self.addEventListener('install', (event) => {
    event.waitUntil(deleteOldCaches());
    event.waitUntil(addResourcesToCache(RESOURCES));
});
  
self.addEventListener('fetch', (event) => {
    event.respondWith(
        cacheFirst({
          request: event.request,
          preloadResponsePromise: event.preloadResponse,
          fallbackURL: "./images/error.png",
        })
    );
});

console.log('[Service Worker] A brand new Service Worker!');

// See https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
