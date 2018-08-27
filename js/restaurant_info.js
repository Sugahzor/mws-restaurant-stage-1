let restaurant;
var map;
let id;
let duplicate = false;
let favIcon;

/* Added for working offline */
document.addEventListener("DOMContentLoaded", event => {
  if (navigator.serviceWorker) {
    navigator.serviceWorker
      .register("sw.js")
      .then(registration => {
        console.log("SW registered", registration);
        if (!navigator.serviceWorker.controller) {
          return;
        }
        if (registration.waiting) {
          console.log("Notify user update is ready so refresh");
          return;
        }
        if (registration.installing) {
          trackSWInstalling(registration.installing);
          return;
        }
        registration.addEventListener("updatefound", () => {
          trackSWInstalling(registration.installing);
        })
      })
      .catch(e => console.log("Registration failed :(", e));
  }
  id = getParameterByName("id");
  favIcon = document.querySelector("#favicon");
  fetchRestaurantFromURL(restaurant => {
    fillBreadcrumb();
  });
  window.addEventListener('offline', function (e) {
    console.log('offline');
  });
  if (navigator.onLine) {
    updateOnlineStatus();
  }
});

function trackSWInstalling(worker) {
  worker.addEventListener("statechange", () => {
    if (worker.state === "installed") {
      console.log("Notify user updates are ready");
    }
  })
}
/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      // fillBreadcrumb();
      DataHandler.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = callback => {
  if (self.restaurant) {
    // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  if (!id) {
    // no id found in URL
    error = "No restaurant id in URL";
    callback(error, null);
  } else {
    DataHandler.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      duplicate = true;
      callback(null, restaurant);
    });
  }
};
/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById("restaurant-name");
  name.innerHTML = restaurant.name;

  const address = document.getElementById("restaurant-address");
  address.innerHTML = restaurant.address;

  const image = document.getElementById("restaurant-img");
  image.className = "restaurant-img";
  image.src = DataHandler.imageUrlForRestaurant(restaurant);
  image.setAttribute("alt", `Restaurant ${restaurant.name} presentation photo`);

  const cuisine = document.getElementById("restaurant-cuisine");
  cuisine.innerHTML = restaurant.cuisine_type;

  if (!duplicate) {
    if (restaurant.is_favorite === "true") {
      favIcon.classList.add("red");
    }
    // fill operating hours
    if (restaurant.operating_hours) {
      fillRestaurantHoursHTML();
    }
    // fill reviews
    fillReviewsHTML();
  }
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (
  operatingHours = self.restaurant.operating_hours
) => {
  const hours = document.getElementById("restaurant-hours");
  for (let key in operatingHours) {
    const row = document.createElement("tr");

    const day = document.createElement("td");
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement("td");
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById("reviews-container");
  const title = document.createElement("h4");
  /* ACCESSIBILITY SETUP */
  title.setAttribute("tabindex", "0");
  /* *** */
  title.innerHTML = "Reviews";
  container.appendChild(title);

  const addReview = document.createElement("a");
  addReview.setAttribute("onclick", "toggleReviewForm()");
  addReview.setAttribute("tabindex", "0");
  addReview.setAttribute("aria-label", `Add your review for ${self.restaurant.name}`);
  addReview.innerHTML = "Add a review";
  addReview.href = "#form-container";
  container.appendChild(addReview);

  if (!reviews) {
    const noReviews = document.createElement("p");
    noReviews.innerHTML = "No reviews yet!";
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById("reviews-list");
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

toggleReviewForm = () => {
  let reviewForm = document.querySelector("#form-container");
  reviewForm.classList.toggle("not-visible");
}

saveForm = (e) => {
  e.preventDefault();
  let createdAt = Date.now();
  let userName = document.querySelector(".reviewer-name").value;
  let rating = document.querySelector(".select-rating").value;
  let userReview = document.querySelector(".review-text").value;

  let newReview = {
    comments: userReview,
    createdAt: createdAt,
    name: userName,
    rating: rating,
    restaurant_id: id,
    updatedAt: createdAt
  }
  fillReviewsHTML([newReview]);
  toggleReviewForm();
  document.querySelector("form").reset();
  if (!navigator.onLine) {
    // add review to local storage
    const localStorageAvailable = storageAvailable("localStorage");
    if (localStorageAvailable) {
      localStorage.setItem(`offlineUserReview${id}`, JSON.stringify(newReview));
    }
  }
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = review => {
  const li = document.createElement("li");
  const name = document.createElement("p");
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement("p");
  date.innerHTML = formatDate(review.updatedAt);
  li.appendChild(date);

  const rating = document.createElement("p");
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement("p");
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById("breadcrumb");
  const li = document.createElement("li");
  li.innerHTML = restaurant.name;
  li.setAttribute("aria-current", "page")
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

formatDate = (unix_timestamp) => {
  // Date formatting thanks to https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
  let date = new Date(unix_timestamp * 1000);
  let options = {
    weekday: "long",
    month: "long",
    day: "numeric"
  };
  return (date.toLocaleDateString("en-US", options));
}

addToFavorites = () => {
  if (favIcon.classList.contains("red")) {
    fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=false`, {
      method: "PUT"
    });
  } else {
    fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=true`, {
      method: "PUT"
    });
  }
  favIcon.classList.toggle("red");
}

function storageAvailable(type) {
  try {
    var storage = window[type],
      x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage.length !== 0
    );
  }
}

updateOnlineStatus = () => {
  reviewToPost = JSON.parse(localStorage.getItem(`offlineUserReview${id}`));
  console.log(reviewToPost);
  if (reviewToPost && reviewToPost.restaurant_id === id) {
    let postUrl = "http://localhost:1337/reviews/";
    fetch(postUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(reviewToPost),
    });
    localStorage.removeItem(`offlineUserReview${id}`);
    window.location.reload(true);
  }
}