class DataHandler{static fetchRestaurants(e){if(navigator.onLine){fetch("http://localhost:1337/restaurants").then(e=>e.json()).then(t=>{window.restaurants=t,this.initDB(),e(null,t)}).catch(t=>{console.log("There was an error: ",t),e(t,null)})}else DataHandler.showCachedRestaurants(e)}static fetchReviewsById(e,t,a){if(navigator.onLine){fetch(`http://localhost:1337/reviews/?restaurant_id=${e}`).then(e=>e.json()).then(e=>{t.reviews=e,a(null,t)}).catch(e=>console.log("There was an error: ",e))}else DataHandler.showCachedReviews(e,a)}static fetchReviews(){fetch("http://localhost:1337/reviews/").then(e=>e.json()).then(e=>{window.reviews=e,this.initReviewsDB()})}static initReviewsDB(){if(!navigator.serviceWorker)return Promise.resolve();let e;window.indexedDB.open("Reviews-DB",1).onupgradeneeded=(t=>{let a=(e=t.target.result).createObjectStore("reviews",{keyPath:"id",autoIncrement:!0});a.createIndex("restaurant_id","restaurant_id",{unique:!1}),a.transaction.oncomplete=(t=>{let a=e.transaction("reviews","readwrite").objectStore("reviews");window.reviews.forEach(e=>a.add(e))})})}static initDB(){if(!navigator.serviceWorker)return Promise.resolve();let e;window.indexedDB.open("Restaurants-DB",1).onupgradeneeded=(t=>{(e=t.target.result).createObjectStore("restaurants",{keyPath:"id",autoIncrement:!0}).transaction.oncomplete=(t=>{let a=e.transaction("restaurants","readwrite").objectStore("restaurants");window.restaurants.forEach(e=>a.add(e))})})}static showCachedRestaurants(e){let t=window.indexedDB.open("Restaurants-DB",1),a=[];t.onsuccess=(()=>{t.result.transaction(["restaurants"]).objectStore("restaurants").openCursor().onsuccess=(t=>{let r=t.target.result;r?(a.push(r.value),r.continue()):(window.restaurants=a,e(null,a))})}),t.onerror=(()=>{console.log("There was an error accessing the DB.")})}static showCachedReviews(e,t,a){let r=window.indexedDB.open("Reviews-DB",1);r.onsuccess=(()=>{let n=r.result.transaction(["reviews"]).objectStore("reviews").index("restaurant_id").get(e);n.onsuccess=(()=>{t.reviews=n.result,a(null,t)})}),r.onerror=(()=>{console.log("There was an error accessing the reviews DB.")})}static fetchRestaurantById(e,t){if(navigator.onLine){fetch(`http://localhost:1337/restaurants/${e}`).then(e=>e.json()).then(a=>{DataHandler.fetchReviewsById(e,a,t)}).catch(e=>console.log("There was an error: ",e))}else DataHandler.showCachedRestaurants(t)}static fetchRestaurantByCuisine(e,t){DataHandler.fetchRestaurants((a,r)=>{if(a)t(a,null);else{const a=r.filter(t=>t.cuisine_type==e);t(null,a)}})}static fetchRestaurantByNeighborhood(e,t){DataHandler.fetchRestaurants((a,r)=>{if(a)t(a,null);else{const a=r.filter(t=>t.neighborhood==e);t(null,a)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,a){DataHandler.fetchRestaurants((r,n)=>{if(r)a(r,null);else{let r=n;"all"!=e&&(r=r.filter(t=>t.cuisine_type==e)),"all"!=t&&(r=r.filter(e=>e.neighborhood==t)),a(null,r)}})}static fetchNeighborhoods(e){DataHandler.fetchRestaurants((t,a)=>{if(t)e(t,null);else{const t=a.map((e,t)=>a[t].neighborhood),r=t.filter((e,a)=>t.indexOf(e)==a);e(null,r)}})}static fetchCuisines(e){DataHandler.fetchRestaurants((t,a)=>{if(t)e(t,null);else{const t=a.map((e,t)=>a[t].cuisine_type),r=t.filter((e,a)=>t.indexOf(e)==a);e(null,r)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return e.photograph||(e.photograph=e.id),`/img/${e.photograph}.webp`}static mapMarkerForRestaurant(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:DataHandler.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}}let restaurants,reviews,neighborhoods,cuisines,favorites;var map,markers=[];const intersectObservable=new IntersectionObserver(e=>{let t=e[0].target;e[0].intersectionRatio>0&&t.dataset.src&&(t.setAttribute("src",t.dataset.src),intersectObservable.unobserve(e[0].target))});function storageAvailable(e){try{var t=window[e],a="__storage_test__";return t.setItem(a,a),t.removeItem(a),!0}catch(e){return e instanceof DOMException&&(22===e.code||1014===e.code||"QuotaExceededError"===e.name||"NS_ERROR_DOM_QUOTA_REACHED"===e.name)&&0!==t.length}}document.addEventListener("DOMContentLoaded",e=>{navigator.serviceWorker&&navigator.serviceWorker.register("sw.js").catch(e=>console.log("Registration failed :(",e)),fetchNeighborhoods(),fetchCuisines(),updateRestaurants(),DataHandler.fetchReviews()}),fetchNeighborhoods=(()=>{DataHandler.fetchNeighborhoods((e,t)=>{e?console.error(e):(self.neighborhoods=t,fillNeighborhoodsHTML())})}),fillNeighborhoodsHTML=((e=self.neighborhoods)=>{const t=document.getElementById("neighborhoods-select");e.forEach(e=>{const a=document.createElement("option");localStorage.getItem("neighborhood")===e&&a.setAttribute("selected","selected"),a.innerHTML=e,a.value=e,t.append(a)})}),fetchCuisines=(()=>{DataHandler.fetchCuisines((e,t)=>{e?console.error(e):(self.cuisines=t,fillCuisinesHTML())})}),fillCuisinesHTML=((e=self.cuisines)=>{const t=document.getElementById("cuisines-select");e.forEach(e=>{const a=document.createElement("option");localStorage.getItem("cuisine")===e&&a.setAttribute("selected","selected"),a.innerHTML=e,a.value=e,t.append(a)})}),window.initMap=(()=>{self.map=new google.maps.Map(document.getElementById("map"),{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1}),updateRestaurants()}),updateRestaurants=(()=>{const e=document.getElementById("cuisines-select"),t=document.getElementById("neighborhoods-select");let a,r,n=e.selectedIndex,s=t.selectedIndex;storageAvailable("localStorage")&&(n>=0?(localStorage.setItem("cuisIndex",n),localStorage.setItem("cuisine",e[n].value)):(n=localStorage.getItem("cuisIndex"),a=localStorage.getItem("cuisine")),s>=0?(localStorage.setItem("neighbIndex",s),localStorage.setItem("neighborhood",t[s].value)):(s=localStorage.getItem("neighbIndex"),r=localStorage.getItem("neighborhood"),t.value=r,localStorage.clear())),a||(a=e[n].value),r||(r=t[s].value),DataHandler.fetchRestaurantByCuisineAndNeighborhood(a,r,(e,t)=>{e?console.error(e):(resetRestaurants(t),fillRestaurantsHTML())})}),resetRestaurants=(e=>{self.restaurants=[],document.getElementById("restaurants-list").innerHTML="",self.markers.forEach(e=>e.setMap(null)),self.markers=[],self.restaurants=e}),fillRestaurantsHTML=((e=self.restaurants)=>{const t=document.getElementById("restaurants-list");if(t.setAttribute("tabindex","0"),t.setAttribute("aria-label","restaurants list"),0===e.length){let e=document.createElement("h1");return e.innerHTML="Sorry, there are no results matching your criteria.",e.setAttribute("tabindex","0"),void t.appendChild(e)}e.forEach(e=>{t.append(createRestaurantHTML(e))}),addMarkersToMap()}),createRestaurantHTML=(e=>{const t=document.createElement("li");t.setAttribute("aria-label","restaurant details");const a=document.createElement("img");a.setAttribute("alt",`Restaurant ${e.name} presentation photo`),a.className="restaurant-img",a.dataset.src=DataHandler.imageUrlForRestaurant(e),intersectObservable.observe(a),t.append(a);const r=document.createElement("h3");r.innerHTML=e.name,t.append(r);const n=document.createElement("span");n.innerHTML="❤","true"===e.is_favorite&&(n.className="red"),t.append(n);const s=document.createElement("p");s.innerHTML=e.neighborhood,t.append(s);const o=document.createElement("p");o.innerHTML=e.address,t.append(o);const i=document.createElement("a");return i.setAttribute("aria-label",e.name+", "+e.neighborhood),i.innerHTML="View Details",i.href=DataHandler.urlForRestaurant(e),t.append(i),t}),addMarkersToMap=((e=self.restaurants)=>{e.forEach(e=>{const t=DataHandler.mapMarkerForRestaurant(e,self.map);google.maps.event.addListener(t,"click",()=>{window.location.href=t.url}),self.markers.push(t)})});