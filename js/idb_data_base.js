class RestaurantsIndexedDB {
  static initDB() {
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }
    let db;
    const dbName = "Restaurants-DB";
    let request = window.indexedDB.open(dbName, 1);

    request.onupgradeneeded = event => {
      db = event.target.result;
      let objectStore = db.createObjectStore("restaurants", {
        keyPath: "id"
      });
      objectStore.transaction.oncomplete = event => {
        let restaurantsObjectStore = db
          .transaction("restaurants", "readwrite")
          .objectStore("restaurants");
        window.restaurants.forEach(restaurant =>
          restaurantsObjectStore.add(restaurant)
        );
      };
    };
  }
  /**** Retrieve and serve restaurants from our DB ****/
  static showCachedRestaurants(callback) {
    const dbName = "Restaurants-DB";
    let dbRequest = window.indexedDB.open(dbName, 1);
    let restaurantsFromIDB = [];

    dbRequest.onsuccess = () => {
      let db = dbRequest.result;
      let transaction = db.transaction(["restaurants"]);
      let store = transaction.objectStore("restaurants");
      store.openCursor().onsuccess = event => {
        let cursor = event.target.result;
        if (cursor) {
          restaurantsFromIDB.push(cursor.value);
          cursor.continue();
        } else {
          callback(null, restaurantsFromIDB);
        }
      };
    };
    return Promise.resolve();
  }
}










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
// let db;
// const dbName = "Restaurants-DB";

// let request = window.indexedDB.open(dbName, 1);

// request.onupgradeneeded = event => {
//   db = event.target.result;
//   var objectStore = db.createObjectStore("restaurants", { keyPath: "id" });

//   // console.log("[IDB] restaurants : ", window.restaurants);

//   objectStore.transaction.oncomplete = event => {
//     let restaurantsObjectStore = db
//       .transaction("restaurants", "readwrite")
//       .objectStore("restaurants");
//     console.log("[IDB] before writing IDB");
//     window.restaurants.forEach(restaurant =>
//       restaurantsObjectStore.add(restaurant)
//     );
//   };
// };


//   request.onsuccess = event => {
//     db = event.target.result;
//     // console.log("[IDB] success: ", JSON.stringify(db), db);
//   };

//   console.log("[IDB] success: ", JSON.stringify(db), db);
//   db.onerror = event =>
//     console.log("Database error code: " + event.target.errorCode);

//   function retrieveRestaurantsFromIdb() {
//     console.log("Entering [IDB] .get");
//     let transaction = db.transaction(["restaurants"]); //IDB name or the store's?
//     let restaurantsFromIDB = transaction.objectStore("restaurants");
//     let request = restaurantsFromIDB.get("id");
//     request.onerror = () => {
//       console.log("[IDB] retrieval error");
//     };
//     request.onsuccess = event => {
//       let data = request.result.name;
//       console.log("[IDB] retrieved restaurants are: ", data);
//     };
//   }
//   retrieveRestaurantsFromIdb();
// })();