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

// // Toggle dropdown visibility when filter button is clicked
// document
//   .querySelector(".filter.filterDropdown")
//   .addEventListener("click", function (event) {
//     const filterButton = event.target.closest(".filterDropdown");

//     if (filterButton) {
//       myFunction(); // Toggle the filter dropdown visibility
//     }
//   });

// function myFunction() {
//   document.getElementById("filter").classList.toggle("show");
// }
// Toggle dropdown visibility when filter button is clicked
function myFunction() {
  const filterDropdown = document.querySelector(".dropdownFilter");

  // Toggle the 'show' class to show or hide the dropdown
  filterDropdown.classList.toggle("show");
}
// document
//   .querySelector(".filter.filterDropdown")
//   .addEventListener("click", function (event) {
//     const filterDropdown = document.querySelector(".dropdownFilter");

//     // Toggle the 'show' class to show or hide the dropdown
//     filterDropdown.classList.toggle("show");
//   });
function chatFunction() {
  document.getElementById("chooseChat").classList.toggle("show");
}

window.onclick = function (event) {
  // Check if the clicked element is inside the filter section or the filter button
  if (
    !event.target.matches(".filterDropdown") &&
    !event.target.closest(".dropdownFilter")
  ) {
    var dropdowns = document.getElementsByClassName("dropdownContent");
    for (let i = 0; i < dropdowns.length; i++) {
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
// Function to fetch properties and display based on the filter
async function fetchAllPropertyDetails(userId, filter = "all") {
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

    // Filter properties based on 'filter' value (Buy, Rent, or All)
    const filteredProperties = propertyData.filter((property) => {
      if (filter === "buy") {
        return property.sellOrRent === "sell";
      } else if (filter === "rent") {
        return property.sellOrRent === "rent";
      }
      return true; // Show all properties by default
    });

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

    // Function to display properties
    function displayProperties(propertiesToDisplay) {
      propertyContainer.innerHTML = ""; // Clear the container before displaying new properties

      if (propertiesToDisplay.length === 0) {
        propertyContainer.innerHTML = "<p>No properties match your search.</p>";
      } else {
        propertiesToDisplay.forEach((property) => {
          const imageUrl = `JS/${property.firstImage}`;
          const isFavorite = favorites.some(
            (fav) => fav.propertyId === property.propertyId
          );
          // Format the price with commas
          const formattedPrice = new Intl.NumberFormat().format(property.price);

          propertyContainer.innerHTML += `
            <div class="property-card" data-property-id="${
              property.propertyId
            }">
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
                  <div class="property-price">Price: ₹${formattedPrice}</div>
                  <div class="property-date">Posted: ${
                    property.createdAtAgo
                  }</div>
                </div>
              </div>
            </div>
          `;
        });
      }
    }

    // Reset filters function
    function resetFilters() {
      // Reset all checkboxes (BHK, Furnishing, Property Type)
      document
        .querySelectorAll(".dropdownFilter input[type='checkbox']")
        .forEach((checkbox) => {
          checkbox.checked = false;
        });

      // Reset the price range to its default max value
      const priceRangeInput = document.getElementById("priceRange");
      priceRangeInput.value = 10000000; // Reset to default max value

      // Update the displayed price value text
      document.getElementById("priceValue").textContent = "₹1,00,00,000"; // Reset price value text

      // Instead of filtering right after reset, just show all properties or leave them unfiltered
      displayProperties(propertyData); // Display all properties (no filter applied)
    }

    // Add event listener for the Reset button to handle the reset functionality
    document
      .querySelector(".filterReset")
      .addEventListener("click", resetFilters);

    // Function to filter properties
    function filterProperties() {
      const selectedBhkTypes = Array.from(
        document.querySelectorAll(".bhk:checked")
      ).map((checkbox) => checkbox.value);
      const selectedPrice = document.getElementById("priceRange").value;
      const selectedFurnishing = Array.from(
        document.querySelectorAll(".furnishing input[type='checkbox']:checked")
      ).map((checkbox) => checkbox.value);
      const selectedPropertyTypes = Array.from(
        document.querySelectorAll(".propertyType:checked")
      ).map((checkbox) => checkbox.value);

      const filteredProperties = propertyData.filter((property) => {
        const isBhkMatch =
          selectedBhkTypes.length === 0 ||
          selectedBhkTypes.includes(property.bedrooms);
        const isPriceMatch = parseInt(property.price) <= selectedPrice;
        const isFurnishingMatch =
          selectedFurnishing.length === 0 ||
          selectedFurnishing.includes(property.furnishingType);
        const isPropertyTypeMatch =
          selectedPropertyTypes.length === 0 ||
          selectedPropertyTypes.includes(property.propertyType);

        return (
          isBhkMatch && isPriceMatch && isFurnishingMatch && isPropertyTypeMatch
        );
      });

      // Update the display with filtered properties
      displayProperties(filteredProperties);
    }

    // Add event listeners for checkboxes (e.g., BHK, Furnishing, Property Type)
    document.querySelectorAll(".bhk").forEach((checkbox) => {
      checkbox.addEventListener("change", filterProperties);
    });
    document
      .querySelectorAll(".furnishing input[type='checkbox']")
      .forEach((checkbox) => {
        checkbox.addEventListener("change", filterProperties);
      });
    document.querySelectorAll(".propertyType").forEach((checkbox) => {
      checkbox.addEventListener("change", filterProperties);
    });

    // Update the price value display when the range slider changes
    document
      .getElementById("priceRange")
      .addEventListener("input", function () {
        const priceRangeValue = this.value;

        const formattedPrice = new Intl.NumberFormat().format(priceRangeValue);

        document.getElementById("priceValue").textContent =
          "₹" + formattedPrice;
        filterProperties();
      });

    // Filter properties based on location search
    function filterPropertiesByLocation() {
      const searchQuery = document
        .getElementById("locationSearch")
        .value.toLowerCase();
      const filteredProperties = propertyData.filter(
        (property) =>
          property.city.toLowerCase().includes(searchQuery) ||
          property.address.toLowerCase().includes(searchQuery) ||
          property.state.toLowerCase().includes(searchQuery)
      );
      displayProperties(filteredProperties); // Display the filtered properties
    }

    // Initial display of all properties
    displayProperties(filteredProperties);

    // Add event listener to the search input
    document
      .getElementById("locationSearch")
      .addEventListener("input", filterPropertiesByLocation);

    // Hide the loading spinner after data is loaded
    document.getElementById("loading").style.display = "none";

    // Add event listener using event delegation
    propertyContainer.addEventListener("click", (event) => {
      if (event.target.closest("svg")) {
        event.stopPropagation();
        return; // Prevent further action
      }

      if (event.target.closest(".property-card")) {
        const propertyCard = event.target.closest(".property-card");
        const propertyId = propertyCard.getAttribute("data-property-id");
        const property = propertyData.find((p) => p.propertyId === propertyId);

        if (property) {
          sessionStorage.setItem("selectedProperty", JSON.stringify(property));
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
document.getElementById("buyLink").addEventListener("click", () => {
  console.log("Buy link clicked");
  fetchAllPropertyDetails(userId, "buy");
});

document.getElementById("rentLink").addEventListener("click", () => {
  console.log("Rent link clicked");
  fetchAllPropertyDetails(userId, "rent");
});
const navLinks = document.querySelectorAll(".nav-links a");

// Function to handle adding/removing the 'active' class
function setActiveLink() {
  navLinks.forEach((link) => {
    link.classList.remove("active"); // Remove active class from all links
  });

  // Add active class to the clicked link
  this.classList.add("active");
}

// Add event listener for each link
navLinks.forEach((link) => {
  link.addEventListener("click", setActiveLink);
});
let userId = null;
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
        userId = data.userId;
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

function logout() {
  localStorage.removeItem("username");
  window.location.href = "Login.html";
}
// This function is called on page load to fetch userId and load properties
window.onload = () => {
  const username = localStorage.getItem("username"); // Get the username from localStorage
  if (username) {
    getUserIdFromUsername(username); // Get the userId using the username
    const homeLink = document.getElementById("homeLink");
    homeLink.classList.add("active"); // Make "Home" active by default on page load
  } else {
    // Redirect to the login page
    window.location.href = "Login.html";
  }
};
