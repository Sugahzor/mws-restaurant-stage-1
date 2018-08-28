class DataHandler{static fetchRestaurants(e){if(navigator.onLine){fetch("http://localhost:1337/restaurants").then(e=>e.json()).then(t=>{window.restaurants=t,this.initDB(),e(null,t)}).catch(t=>{console.log("There was an error: ",t),e(t,null)})}else DataHandler.showCachedRestaurants(e)}static fetchReviewsById(e,t,a){if(navigator.onLine){fetch(`http://localhost:1337/reviews/?restaurant_id=${e}`).then(e=>e.json()).then(e=>{window.reviews=e,t(null,e)}).catch(e=>console.log("There was an error: ",e))}else DataHandler.showCachedReviews(e,t)}static fetchReviews(){fetch("http://localhost:1337/reviews/").then(e=>e.json()).then(e=>{window.reviews=e,this.initReviewsDB()})}static initReviewsDB(){if(!navigator.serviceWorker)return Promise.resolve();let e;window.indexedDB.open("Reviews-DB",1).onupgradeneeded=(t=>{(e=t.target.result).createObjectStore("reviews",{keyPath:"id",autoIncrement:!0}).transaction.oncomplete=(t=>{let a=e.transaction("reviews","readwrite").objectStore("reviews");window.reviews.forEach(e=>a.add(e))})})}static initDB(){if(!navigator.serviceWorker)return Promise.resolve();let e;window.indexedDB.open("Restaurants-DB",1).onupgradeneeded=(t=>{(e=t.target.result).createObjectStore("restaurants",{keyPath:"id",autoIncrement:!0}).transaction.oncomplete=(t=>{let a=e.transaction("restaurants","readwrite").objectStore("restaurants");window.restaurants.forEach(e=>a.add(e))})})}static showCachedRestaurants(e,t){let a=window.indexedDB.open("Restaurants-DB",1),r=[];a.onsuccess=(()=>{a.result.transaction(["restaurants"]).objectStore("restaurants").openCursor().onsuccess=(a=>{let s=a.target.result;s?(r.push(s.value),s.continue()):(window.restaurants=r,t?(window.restaurant=r[t-1],window.restaurant.reviews=[],e(null,r[t-1])):e(null,r))})}),a.onerror=(()=>{console.log("There was an error accessing the DB.")})}static showCachedReviews(e,t){let a=window.indexedDB.open("Reviews-DB",1),r=[];a.onsuccess=(()=>{a.result.transaction(["reviews"],"readonly").objectStore("reviews").openCursor().onsuccess=(a=>{let s=a.target.result;if(s)r.push(s.value),s.continue();else{let a=r.filter(t=>t.restaurant_id===e);window.reviews=a,t(null,a)}})}),a.onerror=(()=>{console.log("There was an error accessing the reviews DB.")})}static fetchRestaurantById(e,t){if(navigator.onLine){fetch(`http://localhost:1337/restaurants/${e}`).then(e=>e.json()).then(e=>{t(null,e)}).catch(e=>console.log("There was an error: ",e))}else DataHandler.showCachedRestaurants(t,e)}static fetchRestaurantByCuisine(e,t){DataHandler.fetchRestaurants((a,r)=>{if(a)t(a,null);else{const a=r.filter(t=>t.cuisine_type==e);t(null,a)}})}static fetchRestaurantByNeighborhood(e,t){DataHandler.fetchRestaurants((a,r)=>{if(a)t(a,null);else{const a=r.filter(t=>t.neighborhood==e);t(null,a)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,a){DataHandler.fetchRestaurants((r,s)=>{if(r)a(r,null);else{let r=s;"all"!=e&&(r=r.filter(t=>t.cuisine_type==e)),"all"!=t&&(r=r.filter(e=>e.neighborhood==t)),a(null,r)}})}static fetchNeighborhoods(e){DataHandler.fetchRestaurants((t,a)=>{if(t)e(t,null);else{const t=a.map((e,t)=>a[t].neighborhood),r=t.filter((e,a)=>t.indexOf(e)==a);e(null,r)}})}static fetchCuisines(e){DataHandler.fetchRestaurants((t,a)=>{if(t)e(t,null);else{const t=a.map((e,t)=>a[t].cuisine_type),r=t.filter((e,a)=>t.indexOf(e)==a);e(null,r)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return e.photograph||(e.photograph=e.id),`/img/${e.photograph}.webp`}static mapMarkerForRestaurant(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:DataHandler.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}}let restaurants,reviews,neighborhoods,cuisines,favorites;var map,markers=[];const intersectObservable=new IntersectionObserver(e=>{let t=e[0].target;e[0].intersectionRatio>0&&t.dataset.src&&(t.setAttribute("src",t.dataset.src),intersectObservable.unobserve(e[0].target))});function storageAvailable(e){try{var t=window[e],a="__storage_test__";return t.setItem(a,a),t.removeItem(a),!0}catch(e){return e instanceof DOMException&&(22===e.code||1014===e.code||"QuotaExceededError"===e.name||"NS_ERROR_DOM_QUOTA_REACHED"===e.name)&&0!==t.length}}document.addEventListener("DOMContentLoaded",e=>{navigator.serviceWorker&&navigator.serviceWorker.register("sw.js").catch(e=>console.log("Registration failed :(",e)),fetchNeighborhoods(),fetchCuisines(),updateRestaurants(),DataHandler.fetchReviews()}),fetchNeighborhoods=(()=>{DataHandler.fetchNeighborhoods((e,t)=>{e?console.error(e):(self.neighborhoods=t,fillNeighborhoodsHTML())})}),fillNeighborhoodsHTML=((e=self.neighborhoods)=>{const t=document.getElementById("neighborhoods-select");e.forEach(e=>{const a=document.createElement("option");localStorage.getItem("neighborhood")===e&&a.setAttribute("selected","selected"),a.innerHTML=e,a.value=e,t.append(a)})}),fetchCuisines=(()=>{DataHandler.fetchCuisines((e,t)=>{e?console.error(e):(self.cuisines=t,fillCuisinesHTML())})}),fillCuisinesHTML=((e=self.cuisines)=>{const t=document.getElementById("cuisines-select");e.forEach(e=>{const a=document.createElement("option");localStorage.getItem("cuisine")===e&&a.setAttribute("selected","selected"),a.innerHTML=e,a.value=e,t.append(a)})}),window.initMap=(()=>{self.map=new google.maps.Map(document.getElementById("map"),{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1}),updateRestaurants()}),updateRestaurants=(()=>{const e=document.getElementById("cuisines-select"),t=document.getElementById("neighborhoods-select");let a,r,s=e.selectedIndex,n=t.selectedIndex;storageAvailable("localStorage")&&(s>=0?(localStorage.setItem("cuisIndex",s),localStorage.setItem("cuisine",e[s].value)):(s=localStorage.getItem("cuisIndex"),a=localStorage.getItem("cuisine")),n>=0?(localStorage.setItem("neighbIndex",n),localStorage.setItem("neighborhood",t[n].value)):(n=localStorage.getItem("neighbIndex"),r=localStorage.getItem("neighborhood"),t.value=r,localStorage.clear())),a||(a=e[s].value),r||(r=t[n].value),DataHandler.fetchRestaurantByCuisineAndNeighborhood(a,r,(e,t)=>{e?console.error(e):(resetRestaurants(t),fillRestaurantsHTML())})}),resetRestaurants=(e=>{self.restaurants=[],document.getElementById("restaurants-list").innerHTML="",self.markers.forEach(e=>e.setMap(null)),self.markers=[],self.restaurants=e}),fillRestaurantsHTML=((e=self.restaurants)=>{const t=document.getElementById("restaurants-list");if(t.setAttribute("tabindex","0"),t.setAttribute("aria-label","restaurants list"),0===e.length){let e=document.createElement("h1");return e.innerHTML="Sorry, there are no results matching your criteria.",e.setAttribute("tabindex","0"),void t.appendChild(e)}e.forEach(e=>{t.append(createRestaurantHTML(e))}),addMarkersToMap()}),createRestaurantHTML=(e=>{const t=document.createElement("li");t.setAttribute("aria-label","restaurant details");const a=document.createElement("img");a.setAttribute("alt",`Restaurant ${e.name} presentation photo`),a.className="restaurant-img",a.dataset.src=DataHandler.imageUrlForRestaurant(e),intersectObservable.observe(a),t.append(a);const r=document.createElement("h3");r.innerHTML=e.name,t.append(r);const s=document.createElement("span");s.innerHTML="❤","true"===e.is_favorite&&(s.className="red"),t.append(s);const n=document.createElement("p");n.innerHTML=e.neighborhood,t.append(n);const o=document.createElement("p");o.innerHTML=e.address,t.append(o);const i=document.createElement("a");return i.setAttribute("aria-label",e.name+", "+e.neighborhood),i.innerHTML="View Details",i.href=DataHandler.urlForRestaurant(e),t.append(i),t}),addMarkersToMap=((e=self.restaurants)=>{e.forEach(e=>{const t=DataHandler.mapMarkerForRestaurant(e,self.map);google.maps.event.addListener(t,"click",()=>{window.location.href=t.url}),self.markers.push(t)})}),loadMap=(()=>{let e=document.querySelector("body"),t=document.createElement("script"),a=document.querySelector("#map");document.querySelector("#show-map").classList.add("not-visible"),a.classList.remove("not-visible"),t.setAttribute("src","https://maps.googleapis.com/maps/api/js?key=AIzaSyCEgBrxO3GXUAHRV-UxwsAQaduQn_bMxLg&libraries=places&callback=initMap"),e.appendChild(t)});