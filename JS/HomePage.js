const PORT = 3001;
let slideIndex = 0;
const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");

// Function to show slides based on index
function showSlides(n) {
  slides.forEach((slide, index) => {
    slide.style.display = "none";
    dots[index].classList.remove("active");
  });

  slideIndex = (n + slides.length) % slides.length;
  slides[slideIndex].style.display = "block";
  dots[slideIndex].classList.add("active");
}

// Move to the next or previous slide
function moveSlide(n) {
  showSlides(slideIndex + n);
}

// Show slide corresponding to the clicked dot
function currentSlide(n) {
  showSlides(n);
}

// Keyboard controls for navigating the slides
function handleKeydown(event) {
  switch (event.key) {
    case "ArrowLeft":
      moveSlide(-1);
      break;
    case "ArrowRight":
      moveSlide(1);
      break;
  }
}

// Add event listeners to dots
dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    currentSlide(index);
  });
});

function time() {
  moveSlide(1);
}

// Initialize the slider on page load
document.addEventListener("DOMContentLoaded", () => {
  showSlides(slideIndex);
  setInterval(() => {
    moveSlide(1);
  }, 4000); // Slide changes every 4 seconds

  // Listen for keyboard events
  document.addEventListener("keydown", handleKeydown);
});

function myFunction() {
  document.getElementById("filter").classList.toggle("show");
}
function chatFunction() {
  document.getElementById("chooseChat").classList.toggle("show");
}

window.onclick = function (event) {
  if (!event.target.matches(".filterDropdown")) {
    var dropdowns = document.getElementsByClassName("dropdownContent");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};

// Function to get cookie value by name for a specific user
function getCookie(name) {
  const cookieArr = document.cookie.split(";");

  // Loop through cookies to find the one for the logged-in user
  for (let i = 0; i < cookieArr.length; i++) {
    let cookie = cookieArr[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length + 1, cookie.length); // Adjusted to correctly get the value
    }
  }

  return "[]"; // Return empty array string if cookie does not exist
}

// Function to set cookie with user-specific cookie name
function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

// Toggle heart icon and save/remove property from cookies for the current user
function toggleFavorite(event, propertyData, userId) {
  const heartIcon = event.target.closest(".heart"); // Ensure the clicked element is a heart icon

  if (!heartIcon) return; // Exit if not a heart icon

  const propertyId = heartIcon.getAttribute("data-property-id");
  const property = propertyData.find((p) => p.propertyId === propertyId);

  if (!property) {
    console.error("Property not found for ID:", propertyId);
    return;
  }

  // Safely parse the favorites cookie data for the logged-in user
  let favorites = [];
  try {
    const userFavorites = getCookie(`favorites_${userId}`);
    favorites = JSON.parse(userFavorites); // Parse the favorites cookie
  } catch (error) {
    console.error("Failed to parse favorites cookie:", error);
    favorites = []; // Fall back to an empty array if parsing fails
  }

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

  // Save the updated favorites array back to cookies
  setCookie(`favorites_${userId}`, JSON.stringify(favorites), 7); // Save favorites for 7 days for the user
  fetchAllPropertyDetails(userId);
}

// Function to get all property details from the backend
async function fetchAllPropertyDetails(userId) {
  try {
    // Show the loading spinner
    document.getElementById("loading").style.display = "flex";
    const response = await fetch("http://localhost:3001/getAllProperties");

    if (!response.ok) {
      throw new Error("Failed to fetch property details");
    }

    const propertyData = await response.json();

    if (propertyData.length === 0) {
      document.getElementById("property-card").innerHTML =
        "<p>No properties found.</p>";
      return;
    }

    const propertyContainer = document.querySelector(".propertyContainer");
    propertyContainer.innerHTML = "";
    let favorites = [];

    try {
      // Safely parse the favorites cookie data for the logged-in user
      favorites = JSON.parse(getCookie(`favorites_${userId}`));
    } catch (error) {
      console.error("Failed to parse favorites cookie:", error);
      favorites = []; // Fallback to an empty array if parsing fails
    }

    propertyData.forEach((property) => {
      const imageUrl = `JS/${property.firstImage}`;
      const isFavorite = favorites.some(
        (fav) => fav.propertyId === property.propertyId
      );

      propertyContainer.innerHTML += `
        <div class="property-card" data-property-id="${property.propertyId}">
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
                  isFavorite ? "filled" : ""
                }" data-property-id="${property.propertyId}">
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
    // Hide the loading spinner after data is loaded
    document.getElementById("loading").style.display = "none";

    // Add event listener using event delegation
    propertyContainer.addEventListener("click", (event) => {
      // Check if the clicked target is an SVG or any element inside it
      if (event.target.closest("svg")) {
        // If an SVG was clicked, stop the event from propagating
        event.stopPropagation();
        return; // Prevent further action
      }

      // Check if the clicked target is a property card (if it's a direct child of .property-card)
      if (event.target.closest(".property-card")) {
        const propertyCard = event.target.closest(".property-card");
        const propertyId = propertyCard.getAttribute("data-property-id");
        const property = propertyData.find((p) => p.propertyId === propertyId);

        if (property) {
          // Store the property details in sessionStorage
          sessionStorage.setItem("selectedProperty", JSON.stringify(property));

          // Redirect to the item page
          window.location.href = "itempage.html";
        }
      }
    });

    // Add event listeners to all heartWrapper elements after DOM is updated
    const heartWrapperElements = document.querySelectorAll(".heart");
    heartWrapperElements.forEach((heartWrapper) => {
      heartWrapper.addEventListener("click", (event) =>
        toggleFavorite(event, propertyData, userId)
      );
    });
  } catch (error) {
    console.error("Error fetching property details:", error);
    document.querySelector(".property-card").innerHTML =
      "<p>Error loading property details. Please try again later.</p>";
    document.getElementById("loading").style.display = "none"; // Hide spinner if there's an error
  }
}

// Function to get the userId from the backend based on username
async function getUserIdFromUsername(username) {
  try {
    const response = await fetch(`http://localhost:${PORT}/getUserId`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Ensure you're sending JSON
      },
      body: JSON.stringify({ username }), // Send the username in the request body
    });

    if (response.ok) {
      const data = await response.json();
      if (data.userId) {
        fetchAllPropertyDetails(data.userId);
      } else {
        console.error("User ID not found in the response");
      }
    } else {
      throw new Error("Failed to fetch userId");
    }
  } catch (error) {
    console.error("Error fetching userId:", error);
  }
}

// This function is called on page load to fetch userId and load properties
window.onload = () => {
  const username = localStorage.getItem("username"); // Get the username from localStorage
  if (username) {
    getUserIdFromUsername(username); // Get the userId using the username
  } else {
    console.error("Username not found in localStorage");
  }
};
