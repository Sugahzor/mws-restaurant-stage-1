// import idb from "./idb";

// (function() {
//     console.log(idb);
//   let dbPromise = idb.open("test-db", 1, upgradeDb => {
//     console.log("creating DB");
//     let keyValStore = upgradeDb.createObjectStore("keyval");
//     keyValStore.put("world", "hello");
//   });
// })();


class IdbImplementation {

  static initDB() {
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }
    let db;
    const dbName = "Restaurants-DB";
    let request = window.indexedDB.open(dbName, 1);
 
    request.onupgradeneeded = event => {
      db = event.target.result;
      let objectStore = db.createObjectStore("restaurants", { keyPath: "id" });

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

  /**** Retrieve and serve restaurants from our DB, if it exists ****/
  static showCachedRestaurants() {
    const dbName = "Restaurants-DB";
    let dbRequest = window.indexedDB.open(dbName, 1);
    let restaurantsFromIDB = [];
    // console.log(dbRequest);
    if (!dbRequest) {
      console.log("[DataHandler]: no DB available");
      return Promise.resolve();
    }
    dbRequest.onsuccess = () => {
      let db = dbRequest.result;
      console.log("DB result after opening is: ", db);
      let transaction = db.transaction(["restaurants"]);
      let store = transaction.objectStore("restaurants");
      store.openCursor().onsuccess = event => {
        let cursor = event.target.result;
        if (cursor) {
          restaurantsFromIDB.push(cursor.value);
          cursor.continue();
        } else {
          console.log("Iteration complete, result is: ", restaurantsFromIDB);
        }
      };
    };
    return Promise.resolve(restaurantsFromIDB);
  }
  /***************************************************************/

}
