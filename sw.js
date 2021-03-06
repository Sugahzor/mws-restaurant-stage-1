let staticCacheName = "restaurants-static-v7_15";
let urlsToCache = [
  "./",
  "index.html",
  "restaurant.html",
  "data/manifest.json",
  "css/indexmin.css",
  "css/restaurantmin.css",
  "data/restaurants.json",
  "js/indexmin.js",
  "js/restaurantmin.js",
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
        let fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(response => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          if (fetchRequest.method === "GET") {
            let responseToCache = response.clone();
            caches.open(staticCacheName)
              .then(cache => cache.put(event.request, responseToCache));
          }
          return response;
        })
      })
    );
  }
});