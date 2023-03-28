const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register("./sw.js");
            if (registration.installing) {
                console.log('[Service Worker] Installing.');
            } else if (registration.waiting) {
                console.log('[Service Worker] Waiting.');
            } else if (registration.active) {
                console.log('[Service Worker] Active.');
            }
        } catch (error) {
            console.error(`[Service Worker] Registration failed. Error: ${error}`);
        }
    }
}

registerServiceWorker();