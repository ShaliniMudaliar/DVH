// Function to set cookies
function setCookie(name, value, days) {
  const expires = new Date(
    Date.now() + days * 24 * 60 * 60 * 1000
  ).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

// Function to get the current logged-in user's username from localStorage
function getUsername() {
  return window.localStorage.getItem("username"); // Get username from localStorage
}

// Function to get a cookie value by name
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";"); // Split all cookies
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1, c.length); // Strip leading spaces
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length); // Return cookie value
    }
  }
  return null; // Return null if cookie doesn't exist
}

// Fetch userId for a given username
async function getUserIdFromUsername(username) {
  try {
    const response = await fetch("http://localhost:3000/getUserId", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }), // Send the username in the body
    });

    if (response.ok) {
      const data = await response.json();
      if (data.userId) {
        console.log("User ID fetched: ", data.userId);
        return data.userId; // Ensure the function returns the userId
      } else {
        console.error("User not found");
      }
    } else {
      throw new Error("Failed to fetch userId");
    }
  } catch (error) {
    console.error("Error fetching userId:", error);
  }
  return null; // Return null if an error occurs
}

// Function to get favorites for the current user using their userId
async function getFavoritesForCurrentUser() {
  const username = getUsername();
  if (!username) {
    console.error("No username found. Make sure you're logged in.");
    return [];
  }

  const userId = await getUserIdFromUsername(username);
  if (!userId) {
    console.error("No userId found for username:", username);
    return [];
  }

  const favoritesCookieName = `favorites_${userId}`;
  const favoritesCookie = getCookie(favoritesCookieName);

  if (!favoritesCookie) {
    return []; // No favorites for this user
  }

  try {
    return JSON.parse(favoritesCookie); // Parse and return the favorites data
  } catch (error) {
    console.error("Failed to parse favorites cookie:", error);
    return []; // Return empty array in case of error
  }
}

// Function to set favorites for the current user using their userId
async function setFavoritesForCurrentUser(favorites) {
  const username = getUsername();
  if (!username) {
    console.error("No username found. Make sure you're logged in.");
    return;
  }

  const userId = await getUserIdFromUsername(username);
  if (!userId) {
    console.error("No userId found for username:", username);
    return;
  }

  const favoritesCookieName = `favorites_${userId}`;
  setCookie(favoritesCookieName, JSON.stringify(favorites), 7); // Store favorites for 7 days
}

// Function to toggle favorite property (add or remove)
async function toggleFavorite(event, propertyData) {
  const heartIcon = event.target.closest(".heart"); // Ensure the clicked element is a heart icon

  if (!heartIcon) return; // Exit if not a heart icon

  const propertyId = heartIcon.getAttribute("data-property-id");
  const property = propertyData.find((p) => p.propertyId === propertyId);

  if (!property) {
    console.error("Property not found for ID:", propertyId);
    return;
  }

  // Get current favorites for the logged-in user
  let favorites = await getFavoritesForCurrentUser();

  const existingPropertyIndex = favorites.findIndex(
    (fav) => fav.propertyId === propertyId
  );

  if (existingPropertyIndex !== -1) {
    // Remove the property from favorites (unclick event)
    heartIcon.classList.remove("filled");
    favorites.splice(existingPropertyIndex, 1); // Remove from favorites
  } else {
    // Add the property to favorites (click event)
    heartIcon.classList.add("filled");
    favorites.push(property); // Add to favorites
  }

  // Save the updated favorites list for the current user
  await setFavoritesForCurrentUser(favorites);
  loadFavorites();
}

// Function to load favorites from cookies and display them
async function loadFavorites() {
  const favorites = await getFavoritesForCurrentUser();

  if (favorites.length === 0) {
    document.querySelector(".propertyContainer").innerHTML =
      "<p>No favorites yet.</p>";
    return;
  }

  const favoritesContainer = document.querySelector(".propertyContainer");
  favoritesContainer.innerHTML = "";

  // Loop through each favorite and display it
  favorites.forEach((property) => {
    const imageUrl = `JS/${property.firstImage}`; // Assuming `firstImage` is the property image URL

    favoritesContainer.innerHTML += `
      <div class="property-card">
        <div class="property-image" style="background-image: url('${imageUrl}');"></div>
        <div class="property-details">
          <div>
            <h2 class="property-title">${property.heading}</h2>
            <p class="property-description">${property.address}, ${
      property.city
    }, ${property.state}</p>
          </div>
          <div class="property-info">
            <div class="property-icons">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 heart ${
                favorites.some((fav) => fav.propertyId === property.propertyId)
                  ? "filled"
                  : ""
              }" data-property-id="${property.propertyId}" data-heading="${
      property.heading
    }" data-price="${property.price}" data-address="${
      property.address
    }" data-city="${property.city}" data-state="${
      property.state
    }" data-firstImage="${property.firstImage}" data-createdAtAgo="${
      property.createdAtAgo
    }">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
            </div>
             <div class="property-views">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="18px" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 eye">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
                <p>1.2K</p>
              </div>
              <div class="property-price">Price: ₹${property.price}</div>
              <div class="property-date">Posted: ${property.createdAtAgo}</div>
             </div>
        </div>
      </div>
    `;
  });

  // Add event listeners to all heartWrapper elements after DOM is updated
  const heartWrapperElements = document.querySelectorAll(".heart");
  heartWrapperElements.forEach((heartWrapper) => {
    heartWrapper.addEventListener("click", (event) =>
      toggleFavorite(event, favorites)
    );
  });
}

window.onload = loadFavorites;
