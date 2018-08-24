let staticCacheName = "restaurants-static-v5_16";
let urlsToCache = [
  "./",
  "index.html",
  "restaurant.html",
  "data/manifest.json",
  "css/critical.css",
  "css/index.css",
  "css/restaurant.css",
  "data/restaurants.json",
  "js/data_handler.js",
  "js/main.js",
  "js/restaurant_info.js",
  "img/1.webp",
  "img/2.webp",
  "img/3.webp",
  "img/4.webp",
  "img/5.webp",
  "img/6.webp",
  "img/7.webp",
  "img/8.webp",
  "img/9.webp",
  "img/10.webp"
];


self.addEventListener("install", event => {
  event.waitUntil(
    caches
    .open(staticCacheName)
    .then(cache => cache.addAll(urlsToCache))
    .then(self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(cacheNames.map(cache => {
      if (cache !== staticCacheName) {
        return caches.delete(cache);
      }
    })))
  )
})

self.addEventListener("fetch", event => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
    );
  }
});