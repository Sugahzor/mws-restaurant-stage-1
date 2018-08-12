/**
 * Common database helper functions.
 */
// DBHelper
class DataHandler {

  /* FETCH RESTAURANTS FROM THE SERVER OR INDEXEDB IF OFFLINE*/
  static fetchRestaurants(callback) {
    if (!navigator.onLine) {
      DataHandler.showCachedRestaurants(callback);
    } else {
      const rootUrl = "http://localhost:1337/restaurants";
      fetch("http://localhost:1337/restaurants/")
        .then(response => response.json())
        .then(restaurants => {
          // console.log(restaurants);
          window.restaurants = restaurants;
          /* initialise database the first time it's called - onupgradeneeded will fire */
          this.initDB();
          callback(null, restaurants);
        })
        .catch(err => {
          console.log("There was an error: ", err);
          callback(err, null);
        });
    }
  }

  static fetchReviewsById(id, restaurant, callback) {
    if (!navigator.onLine) {
      DataHandler.showCachedReviews(id, callback);
    } else {
      const rootUrl = `http://localhost:1337/reviews/?restaurant_id=${id}`;
      fetch(rootUrl)
        .then(response => response.json())
        .then(reviewsById => {
          restaurant.reviews = reviewsById;
          // Got the restaurant and it's reviews
          callback(null, restaurant);
        })
        .catch(err => console.log("There was an error: ", err));
    }
  }

  static fetchReviews() {
    const GET_REVIEWS_URL = "http://localhost:1337/reviews/";
    fetch(GET_REVIEWS_URL)
      .then(response => response.json())
      .then(reviews => {
        window.reviews = reviews;
        this.initReviewsDB();
        // console.log(reviews);
      })
  }

  static initReviewsDB() {
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }
    let db;
    const dbName = "Reviews-DB";
    let request = window.indexedDB.open(dbName, 1);

    request.onupgradeneeded = event => {
      db = event.target.result;
      let objectStore = db.createObjectStore("reviews", {
        keyPath: "id"
      });
      objectStore.createIndex("restaurant_id", "restaurant_id", { unique: false });
      objectStore.transaction.oncomplete = event => {
        let reviewsObjectStore = db
          .transaction("reviews", "readwrite")
          .objectStore("reviews");
        window.reviews.forEach(review =>
          reviewsObjectStore.add(review)
        );
      };
    };
  }

  /****************** DB implementation ******************/
  /***** DB init with values *******/
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
          window.restaurants = restaurantsFromIDB;
          callback(null, restaurantsFromIDB);
        }
      };
    };
    dbRequest.onerror = () => {
      console.log("There was an error accessing the DB.");
    }
  }
  static showCachedReviews(id, restaurant, callback) {
    const dbName = "Reviews-DB";
    let dbRequest = window.indexedDB.open(dbName, 1);
    let reviewsFromDB = [];

    dbRequest.onsuccess = () => {
      let dbReviews = dbRequest.result;
      let tx = dbReviews.transaction(["reviews"]);
      let store = tx.objectStore("reviews");
      let index = store.index("restaurant_id");

      let reviewsFromDBbyId = index.get(id);
      reviewsFromDBbyId.onsuccess = () => {
        restaurant.reviews = reviewsFromDBbyId.result;
        console.log("from showCachedReviews: ", restaurant.reviews);
        callback(null, restaurant);
      }
    }
    dbRequest.onerror = () => {
      console.log("There was an error accessing the reviews DB.");
    }
  }

  /***************************************************************/
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {

    if (!navigator.onLine) {
      DataHandler.showCachedRestaurants(callback)
    }
    // fetch all restaurants with proper error handling.
    DataHandler.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) {
          //Fetch reviews
          DataHandler.fetchReviewsById(id, restaurant, callback);          
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



// POST request:
// fetch('url', {
//   method: 'POST',
//   body: JSON.stringify(the data to POST),
//   headers: { 'content-type': 'application/json' }
// })
// .then(response => response.json())
// .catch(error => { console.log(error); 
// });