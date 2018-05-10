/**
 * Common database helper functions.
 */
// DBHelper

// class IdbImplementation {
//   static initDB() {
//     if (!navigator.serviceWorker) {
//       return Promise.resolve();
//     }
//     let db;
//     const dbName = "Restaurants-DB";
//     let request = window.indexedDB.open(dbName, 1);

//     request.onupgradeneeded = event => {
//       db = event.target.result;
//       console.log(db, "db");
//       let objectStore = db.createObjectStore("restaurants", { keyPath: "id" });
//       console.log(objectStore);

//       objectStore.transaction.oncomplete = event => {
//         let restaurantsObjectStore = db
//           .transaction("restaurants", "readwrite")
//           .objectStore("restaurants");
//         window.restaurants.forEach(restaurant =>
//           restaurantsObjectStore.add(restaurant)
//         );
//       };
//     };
//   }

//   /**** Retrieve and serve restaurants from our DB, if it exists ****/
//   static showCachedRestaurants(callback) {
//     const dbName = "Restaurants-DB";
//     let dbRequest = window.indexedDB.open(dbName, 1);
//     let restaurantsFromIDB = [];
//     if (!dbRequest) {
//       console.log("[DataHandler]: no DB available");
//       return Promise.resolve();
//     }
//     dbRequest.onsuccess = () => {
//       let db = dbRequest.result;
//       // console.log("DB result after opening is: ", db);
//       let transaction = db.transaction(["restaurants"]);
//       let store = transaction.objectStore("restaurants");
//       store.openCursor().onsuccess = event => {
//         let cursor = event.target.result;
//         if (cursor) {
//           restaurantsFromIDB.push(cursor.value);
//           cursor.continue();
//         } else {
//           console.log("Iteration complete, result is: ", restaurantsFromIDB);
//           // if (restaurantsFromIDB) {
//           callback(null, restaurantsFromIDB);
//           // }
//         }
//       };
//     };
//     // return Promise.resolve(restaurantsFromIDB);
//   }
//   /***************************************************************/
// }


class DataHandler {
  /* FETCH RESTAURANTS FROM THE SERVER */

  static fetchRestaurants(callback) {
    const rootUrl = "http://localhost:1337/restaurants";
    console.log(window.restaurants);

    // if (window.restaurants) {
      IdbImplementation.showCachedRestaurants(callback);
      // console.log("On IdbImplementation if branch");
    // }

    fetch("http://localhost:1337/restaurants")
      .then(response => response.json())
      .then(restaurants => {
        window.restaurants = restaurants;
        console.log(window.restaurants);
        /* initialise database */
        IdbImplementation.initDB();
        callback(null, restaurants);
      })
      .catch(err => {
        console.log("There was an error: ", err);
        callback(err, null);
      });
  }

  
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DataHandler.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) {
          // Got the restaurant
          callback(null, restaurant);
        } else {
          // Restaurant does not exist in the database
          callback("Restaurant does not exist", null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DataHandler.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DataHandler.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    DataHandler.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != "all") {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != "all") {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DataHandler.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map(
          (v, i) => restaurants[i].neighborhood
        );
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        );
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DataHandler.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        );
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL. REFACTORED FOR SERVER CALLS
   */
  static imageUrlForRestaurant(restaurant) {
    if (!restaurant.photograph) {
      restaurant.photograph = restaurant.id;
    }
    return `/img/${restaurant.photograph}.jpg`;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DataHandler.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }
}
