class DataHandler{static fetchRestaurants(e){if(navigator.onLine){fetch("http://localhost:1337/restaurants").then(e=>e.json()).then(t=>{window.restaurants=t,this.initDB(),e(null,t)}).catch(t=>{console.log("There was an error: ",t),e(t,null)})}else DataHandler.showCachedRestaurants(e)}static fetchReviewsById(e,t,a){if(navigator.onLine){fetch(`http://localhost:1337/reviews/?restaurant_id=${e}`).then(e=>e.json()).then(e=>{t.reviews=e,a(null,t)}).catch(e=>console.log("There was an error: ",e))}else DataHandler.showCachedReviews(e,a)}static fetchReviews(){fetch("http://localhost:1337/reviews/").then(e=>e.json()).then(e=>{window.reviews=e,this.initReviewsDB()})}static initReviewsDB(){if(!navigator.serviceWorker)return Promise.resolve();let e;window.indexedDB.open("Reviews-DB",1).onupgradeneeded=(t=>{let a=(e=t.target.result).createObjectStore("reviews",{keyPath:"id",autoIncrement:!0});a.createIndex("restaurant_id","restaurant_id",{unique:!1}),a.transaction.oncomplete=(t=>{let a=e.transaction("reviews","readwrite").objectStore("reviews");window.reviews.forEach(e=>a.add(e))})})}static initDB(){if(!navigator.serviceWorker)return Promise.resolve();let e;window.indexedDB.open("Restaurants-DB",1).onupgradeneeded=(t=>{(e=t.target.result).createObjectStore("restaurants",{keyPath:"id",autoIncrement:!0}).transaction.oncomplete=(t=>{let a=e.transaction("restaurants","readwrite").objectStore("restaurants");window.restaurants.forEach(e=>a.add(e))})})}static showCachedRestaurants(e){let t=window.indexedDB.open("Restaurants-DB",1),a=[];t.onsuccess=(()=>{t.result.transaction(["restaurants"]).objectStore("restaurants").openCursor().onsuccess=(t=>{let n=t.target.result;n?(a.push(n.value),n.continue()):(window.restaurants=a,e(null,a))})}),t.onerror=(()=>{console.log("There was an error accessing the DB.")})}static showCachedReviews(e,t,a){let n=window.indexedDB.open("Reviews-DB",1);n.onsuccess=(()=>{let r=n.result.transaction(["reviews"]).objectStore("reviews").index("restaurant_id").get(e);r.onsuccess=(()=>{t.reviews=r.result,a(null,t)})}),n.onerror=(()=>{console.log("There was an error accessing the reviews DB.")})}static fetchRestaurantById(e,t){if(navigator.onLine){fetch(`http://localhost:1337/restaurants/${e}`).then(e=>e.json()).then(a=>{DataHandler.fetchReviewsById(e,a,t)}).catch(e=>console.log("There was an error: ",e))}else DataHandler.showCachedRestaurants(t)}static fetchRestaurantByCuisine(e,t){DataHandler.fetchRestaurants((a,n)=>{if(a)t(a,null);else{const a=n.filter(t=>t.cuisine_type==e);t(null,a)}})}static fetchRestaurantByNeighborhood(e,t){DataHandler.fetchRestaurants((a,n)=>{if(a)t(a,null);else{const a=n.filter(t=>t.neighborhood==e);t(null,a)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,a){DataHandler.fetchRestaurants((n,r)=>{if(n)a(n,null);else{let n=r;"all"!=e&&(n=n.filter(t=>t.cuisine_type==e)),"all"!=t&&(n=n.filter(e=>e.neighborhood==t)),a(null,n)}})}static fetchNeighborhoods(e){DataHandler.fetchRestaurants((t,a)=>{if(t)e(t,null);else{const t=a.map((e,t)=>a[t].neighborhood),n=t.filter((e,a)=>t.indexOf(e)==a);e(null,n)}})}static fetchCuisines(e){DataHandler.fetchRestaurants((t,a)=>{if(t)e(t,null);else{const t=a.map((e,t)=>a[t].cuisine_type),n=t.filter((e,a)=>t.indexOf(e)==a);e(null,n)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return e.photograph||(e.photograph=e.id),`/img/${e.photograph}.webp`}static mapMarkerForRestaurant(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:DataHandler.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}}let restaurant;var map;let id,favIcon,duplicate=!1;function trackSWInstalling(e){e.addEventListener("statechange",()=>{"installed"===e.state&&console.log("Notify user updates are ready")})}function storageAvailable(e){try{var t=window[e],a="__storage_test__";return t.setItem(a,a),t.removeItem(a),!0}catch(e){return e instanceof DOMException&&(22===e.code||1014===e.code||"QuotaExceededError"===e.name||"NS_ERROR_DOM_QUOTA_REACHED"===e.name)&&0!==t.length}}document.addEventListener("DOMContentLoaded",e=>{navigator.serviceWorker&&navigator.serviceWorker.register("sw.js").then(e=>{console.log("SW registered",e),navigator.serviceWorker.controller&&(e.waiting?console.log("Notify user update is ready so refresh"):e.installing?trackSWInstalling(e.installing):e.addEventListener("updatefound",()=>{trackSWInstalling(e.installing)}))}).catch(e=>console.log("Registration failed :(",e)),id=getParameterByName("id"),favIcon=document.querySelector("#favicon"),fetchRestaurantFromURL(e=>{fillBreadcrumb()}),window.addEventListener("offline",function(e){console.log("offline")}),navigator.onLine&&updateOnlineStatus()}),window.initMap=(()=>{fetchRestaurantFromURL((e,t)=>{e?console.error(e):(self.map=new google.maps.Map(document.getElementById("map"),{zoom:16,center:t.latlng,scrollwheel:!1}),DataHandler.mapMarkerForRestaurant(self.restaurant,self.map))})}),fetchRestaurantFromURL=(e=>{self.restaurant?e(null,self.restaurant):id?DataHandler.fetchRestaurantById(id,(t,a)=>{self.restaurant=a,a?(fillRestaurantHTML(),duplicate=!0,e(null,a)):console.error(t)}):(error="No restaurant id in URL",e(error,null))}),fillRestaurantHTML=((e=self.restaurant)=>{document.getElementById("restaurant-name").innerHTML=e.name,document.getElementById("restaurant-address").innerHTML=e.address;const t=document.getElementById("restaurant-img");t.className="restaurant-img",t.src=DataHandler.imageUrlForRestaurant(e),t.setAttribute("alt",`Restaurant ${e.name} presentation photo`),document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,duplicate||("true"===e.is_favorite&&favIcon.classList.add("red"),e.operating_hours&&fillRestaurantHoursHTML(),fillReviewsHTML())}),fillRestaurantHoursHTML=((e=self.restaurant.operating_hours)=>{const t=document.getElementById("restaurant-hours");for(let a in e){const n=document.createElement("tr"),r=document.createElement("td");r.innerHTML=a,n.appendChild(r);const o=document.createElement("td");o.innerHTML=e[a],n.appendChild(o),n.setAttribute("tabindex","0"),t.appendChild(n)}}),fillReviewsHTML=((e=self.restaurant.reviews)=>{const t=document.getElementById("reviews-container"),a=document.createElement("h4");a.setAttribute("tabindex","0"),a.innerHTML="Reviews",t.appendChild(a);const n=document.createElement("a");if(n.setAttribute("onclick","toggleReviewForm()"),n.setAttribute("tabindex","0"),n.setAttribute("aria-label",`Add your review for ${self.restaurant.name}`),n.innerHTML="Add a review",n.href="#form-container",t.appendChild(n),!e){const e=document.createElement("p");return e.innerHTML="No reviews yet!",void t.appendChild(e)}const r=document.getElementById("reviews-list");e.forEach(e=>{r.appendChild(createReviewHTML(e))}),t.appendChild(r)}),toggleReviewForm=(()=>{document.querySelector("#form-container").classList.toggle("not-visible")}),saveForm=(e=>{e.preventDefault();let t=Date.now(),a=document.querySelector(".reviewer-name").value,n=document.querySelector(".select-rating").value,r={comments:document.querySelector(".review-text").value,createdAt:t,name:a,rating:n,restaurant_id:id,updatedAt:t};if(fillReviewsHTML([r]),toggleReviewForm(),document.querySelector("form").reset(),!navigator.onLine){storageAvailable("localStorage")&&localStorage.setItem(`offlineUserReview${id}`,JSON.stringify(r))}}),createReviewHTML=(e=>{const t=document.createElement("li");t.setAttribute("tabindex","0");const a=document.createElement("p");a.innerHTML=e.name,t.appendChild(a);const n=document.createElement("p");n.innerHTML=formatDate(e.updatedAt),t.appendChild(n);const r=document.createElement("p");r.innerHTML=`Rating: ${e.rating}`,t.appendChild(r);const o=document.createElement("p");return o.innerHTML=e.comments,t.appendChild(o),t}),fillBreadcrumb=((e=self.restaurant)=>{const t=document.getElementById("breadcrumb"),a=document.createElement("li");a.innerHTML=e.name,a.setAttribute("aria-current","page"),t.appendChild(a)}),getParameterByName=((e,t)=>{t||(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");const a=new RegExp(`[?&]${e}(=([^&#]*)|&|#|$)`).exec(t);return a?a[2]?decodeURIComponent(a[2].replace(/\+/g," ")):"":null}),formatDate=(e=>{return new Date(1e3*e).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}),addToFavorites=(()=>{favIcon.classList.contains("red")?fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=false`,{method:"PUT"}):fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=true`,{method:"PUT"}),favIcon.classList.toggle("red")}),updateOnlineStatus=(()=>{if(reviewToPost=JSON.parse(localStorage.getItem(`offlineUserReview${id}`)),console.log(reviewToPost),reviewToPost&&reviewToPost.restaurant_id===id){fetch("http://localhost:1337/reviews/",{method:"POST",headers:{"Content-Type":"application/json; charset=utf-8"},body:JSON.stringify(reviewToPost)}),localStorage.removeItem(`offlineUserReview${id}`),window.location.reload(!0)}});