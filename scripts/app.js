if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
      navigator.serviceWorker
        .register("./sw.js")
        .then($ => console.log("[Service Worker] Registered."))
        .catch(error => console.log("[Service Worker] Not registered.", error))
    })
  }