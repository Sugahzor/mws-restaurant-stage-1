// import idb from "./idb";



// (function() {
//     console.log(idb);
//   let dbPromise = idb.open("test-db", 1, upgradeDb => {
//     console.log("creating DB");
//     let keyValStore = upgradeDb.createObjectStore("keyval");
//     keyValStore.put("world", "hello");
//   });
// })();

// (function() {
//   let db;
//   const dbName = "Restaurants-DB";

//   let request = window.indexedDB.open(dbName, 1);

//   request.onupgradeneeded = event => {
//     let db = event.target.result;
//     let objectStore = db.createObjectStore("restaurants", { keyPath: "id" });

//     console.log("[IDB] restaurants : ", window.restaurants);

//     objectStore.transaction.oncomplete = event => {
//       let restaurantsObjectStore = db
//         .transaction("restaurants", "readwrite")
//         .objectStore("restaurants");
//       window.restaurants.forEach(restaurant =>
//         restaurantsObjectStore.add(restaurant)
//       );
//     };
//   };

//   request.onerror = event =>
//     console.log("Database error code: " + event.target.errorCode);
//   request.onsuccess = event => {
//     db = event.target.result;
//     console.log("[IDB] success: ", JSON.stringify(db));
//   };
// })();
