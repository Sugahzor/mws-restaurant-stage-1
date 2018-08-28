class DataHandler {

  /* FETCH RESTAURANTS FROM THE SERVER OR INDEXEDB IF OFFLINE*/
  static fetchRestaurants(callback) {
    if (!navigator.onLine) {
      DataHandler.showCachedRestaurants(callback);
    } else {
      const rootUrl = "http://localhost:1337/restaurants";
      fetch(rootUrl)
        .then(response => response.json())
        .then(restaurants => {
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

  static fetchReviewsById(id, callback, restaurant) {
    if (!navigator.onLine) {
      DataHandler.showCachedReviews(id, callback);
    } else {
      const rootUrl = `http://localhost:1337/reviews/?restaurant_id=${id}`;
      fetch(rootUrl)
        .then(response => response.json())
        .then(reviewsById => {
          window.reviews = reviewsById;
          callback(null, reviewsById);
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
        keyPath: "id",
        autoIncrement: true
      });
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
        keyPath: "id",
        autoIncrement: true
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
  static showCachedRestaurants(callback, idArg) {
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
          if (idArg) {
            window.restaurant = restaurantsFromIDB[idArg - 1];
            window.restaurant.reviews = [];
            callback(null, restaurantsFromIDB[idArg - 1]);
          } else {
            callback(null, restaurantsFromIDB);
          }
        }
      };
    };
    dbRequest.onerror = () => {
      console.log("There was an error accessing the DB.");
    }
  }

  static showCachedReviews(id, callback) {
    const dbName = "Reviews-DB";
    let dbRequest = window.indexedDB.open(dbName, 1);
    let reviewsFromIDB = [];

    dbRequest.onsuccess = () => {
      let dbReviews = dbRequest.result;
      let tx = dbReviews.transaction(["reviews"], "readonly");
      let store = tx.objectStore("reviews");
      store.openCursor().onsuccess = event => {
        let cursor = event.target.result;
        if (cursor) {
          reviewsFromIDB.push(cursor.value);
          cursor.continue();
        } else {
          let reviewsById = reviewsFromIDB.filter(review => review.restaurant_id === id);
          window.reviews = reviewsById;
          callback(null, reviewsById);
        }
      }
    }
    dbRequest.onerror = () => {
      console.log("There was an error accessing the reviews DB.");
    }
  }

  // ************************************************************
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    if (!navigator.onLine) {
      DataHandler.showCachedRestaurants(callback, id);
    } else {
      const rootUrl = `http://localhost:1337/restaurants/${id}`;
      fetch(rootUrl)
        .then(response => response.json())
        .then(restaurantById => {
          callback(null, restaurantById);
        })
        .catch(err => console.log("There was an error: ", err));
    }
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
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

  static fetchRestaurantByNeighborhood(neighborhood, callback) {
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

  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
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
    return `/img/${restaurant.photograph}.webp`;
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