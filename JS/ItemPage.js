const mainImage = document.getElementById("main-image");
const images = document.querySelectorAll(".product__image");

let userId = null; // Declare userId globally
let isFirstClick = true; // Flag to track the first click

// Function to fetch all properties from the backend
async function fetchAllProperties() {
  try {
    const response = await fetch("http://localhost:3001/getAllProperties");

    if (!response.ok) {
      throw new Error("Failed to fetch properties");
    }

    const properties = await response.json();
    return properties; // Return the properties
  } catch (error) {
    console.error("Error fetching properties:", error);
    return []; // Return an empty array in case of error
  }
}

// Function to toggle the dropdown menu (show/hide)
function myFunction() {
  document.getElementById("threeDotDropDown").classList.toggle("show");
}

function viewIn360() {
  console.log("First Click: Activating 360-degree view");

  const mainImage = document.getElementById("main-image");
  const imageUrl = mainImage.src;

  // Set the 360-degree image to the a-sky element
  const skyElement = document.getElementById("360-degree-image");
  skyElement.setAttribute("src", imageUrl);

  // Show the 360-degree container
  document.getElementById("360-degree-container").classList.remove("hidden");
  document.querySelector(".product").classList.add("hidden");

  // Ensure the A-Frame scene has loaded
  const aframeScene = document.querySelector("a-scene");
  if (aframeScene) {
    aframeScene.emit("loaded"); // This will trigger any necessary rendering
  }

  // Manually trigger the VR mode (enter VR)
  const vrButton = document
    .querySelector("a-scene")
    .querySelector("a-camera")
    .querySelector("a-entity");
  if (vrButton) {
    vrButton.emit("enter-vr"); // Triggering VR manually
  }

  // Hide the dropdown menu
  document.getElementById("threeDotDropDown").classList.remove("show");
}

// Single window.onclick function to handle both dropdown and modal clicks
window.onclick = function (event) {
  // Handle dropdown
  if (!event.target.matches(".threeDot")) {
    var dropdowns = document.getElementsByClassName("dropdownContent");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }

  // Handle modal close when clicked outside the modal
  if (event.target == modal) {
    modal.style.display = "none"; // Hide the modal
  }
};

// Function to get the userId based on username from the backend
async function getUserIdFromUsername(username) {
  try {
    const response = await fetch(`http://localhost:3001/getUserId`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }), // Send the username in the request body
    });

    if (response.ok) {
      const data = await response.json();
      if (data.userId) {
        return data.userId; // Return the userId after fetching it
      } else {
        console.error("User ID not found in the response");
      }
    } else {
      throw new Error("Failed to fetch userId");
    }
  } catch (error) {
    console.error("Error fetching userId:", error);
  }
  return null; // Return null in case of failure
}

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

// Function to toggle the favorite status (add/remove)
async function toggleFavorite(event) {
  event.stopPropagation();

  // Ensure userId is available
  if (!userId) {
    console.error("User ID is not available");
    return;
  }

  const propertyId = event.target
    .closest(".subThreeDot.fav")
    .getAttribute("data-property-id");

  if (!propertyId) {
    console.error("Property ID not found");
    return;
  }

  // Fetch all properties if needed (you may want to cache them to avoid fetching repeatedly)
  const properties = await fetchAllProperties();
  const property = properties.find((prop) => prop.propertyId === propertyId);

  if (!property) {
    console.error("Property not found");
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

  const favButton = event.target.closest(".subThreeDot.fav");

  if (existingPropertyIndex !== -1) {
    // Remove property from favorites
    favorites.splice(existingPropertyIndex, 1);
    favButton.classList.remove("filled"); // Remove the filled class (unlike)
  } else {
    // Add property to favorites (with all its details)
    favorites.push(property);
    favButton.classList.add("filled"); // Add the filled class (like)
  }

  // Save updated favorites back to cookies using userId
  setCookie(`favorites_${userId}`, JSON.stringify(favorites), 7); // Save favorites for 7 days for the user
}

// Function to update the favorite icon based on whether the property is in favorites
function updateFavoriteIcon(propertyId) {
  const favButton = document.querySelector(".subThreeDot.fav");
  if (!favButton) return;

  if (!userId) return;

  const favorites = JSON.parse(getCookie(`favorites_${userId}`)) || [];
  const isFavorite = favorites.some((fav) => fav.propertyId === propertyId);

  if (isFavorite) {
    favButton.classList.add("filled");
  } else {
    favButton.classList.remove("filled");
  }
}

// Function to get the username from localStorage
function getUsername() {
  const username = localStorage.getItem("username");
  return username;
}

// Add event listener to the favorite button after userId is set
async function initialize() {
  const username = getUsername();
  if (username) {
    userId = await getUserIdFromUsername(username); // Wait for the userId to be fetched
    if (!userId) {
      console.error("User ID is still not available");
    } else {
      // Now we can safely add the event listener to the favorite button
      const favButton = document.querySelector(".subThreeDot.fav");
      if (favButton) {
        favButton.addEventListener("click", toggleFavorite);
      }

      // After initialization, update the favorite icon based on cookie data
      const property = JSON.parse(sessionStorage.getItem("selectedProperty"));
      if (property && property.propertyId) {
        updateFavoriteIcon(property.propertyId);
      }
    }
  }
}

// Function to handle image click to toggle 360-degree view
function handleImageClick(event) {
  if (isFirstClick) {
    viewIn360(); // Show the 360-degree view on the first click
    isFirstClick = false; // Set the flag to false after the first click
  } else {
    // You can add logic to go back to the regular view if needed
    document.querySelector(".product").classList.remove("hidden");
    document.getElementById("360-degree-container").classList.add("hidden");
  }
}

// Run all the functions once the page is loaded
window.onload = async function () {
  initialize(); // Fetch the userId and add the event listener

  const property = JSON.parse(sessionStorage.getItem("selectedProperty"));
  if (property) {
    const mainImage = document.getElementById("main-image");
    if (property.allImage && property.allImage.length > 0) {
      mainImage.src = `JS/${property.allImage[0]}`;
    }

    const smallImagesContainer = document.querySelector(".product__slider");
    smallImagesContainer.innerHTML = "";

    property.allImage.forEach((imageUrl, index) => {
      const imageElement = document.createElement("img");
      imageElement.src = `JS/${imageUrl}`;
      imageElement.alt = `Property Image ${index + 1}`;
      imageElement.classList.add("product__image");
      smallImagesContainer.appendChild(imageElement);

      imageElement.addEventListener("click", (event) => {
        mainImage.src = event.target.src;

        const activeImage = document.querySelector(".product__image--active");
        if (activeImage) {
          activeImage.classList.remove("product__image--active");
        }
        event.target.classList.add("product__image--active");
      });

      if (index === 0) {
        imageElement.classList.add("product__image--active");
      }
    });

    // Add event listener to the main image for 360-degree view functionality
    mainImage.addEventListener("click", handleImageClick);

    const favIcon = document.querySelector(".subThreeDot.fav");
    if (favIcon) {
      favIcon.setAttribute("data-property-id", property.propertyId);
    }
    await displayReviews(property.propertyId);
    fetchProperties();
  }
};
// Get the modal
var modal = document.getElementById("reviewModal");

// Get the button that opens the modal
var btn = document.querySelector(".review-button");

// Get the <span> element that closes the modal
var span = document.querySelector(".close");

// When the user clicks the "Write Review" button, open the modal
btn.onclick = function () {
  modal.style.display = "flex"; // Show the modal
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none"; // Hide the modal
};

// When the user clicks anywhere outside of the modal, close it
// window.onclick = function (event) {
//   if (event.target == modal) {
//     modal.style.display = "none"; // Hide the modal
//   }
// };

// Handle star selection for each category
document.querySelectorAll(".star-rating .star").forEach(function (star) {
  star.addEventListener("click", function () {
    var ratingId = star.closest(".star-rating").id; // Get the parent rating category ID (e.g., safetyRating, connectivityRating, etc.)
    var ratingValue = star.getAttribute("data-value"); // Get the value of the clicked star (1-5)

    // Remove selected class from all stars in the current category
    document
      .querySelectorAll("#" + ratingId + " .star")
      .forEach(function (star) {
        star.classList.remove("selected");
      });

    // Add selected class to clicked star and all previous stars
    for (var i = 0; i < ratingValue; i++) {
      document
        .querySelectorAll("#" + ratingId + " .star")
        [i].classList.add("selected");
    }
  });
});

// Handle review submission
document.getElementById("submitReview").onclick = function () {
  // Fetch selected rating values for each category
  var safety = getSelectedRating("#safetyRating");
  var connectivity = getSelectedRating("#connectivityRating");
  var neighbourhood = getSelectedRating("#neighbourhoodRating");
  var livability = getSelectedRating("#livabilityRating");
  var overall = getSelectedRating("#overallRating");

  // Get the review text
  var reviewText = document.getElementById("reviewText").value;

  // Get the property ID from the session storage or another method
  const property = JSON.parse(sessionStorage.getItem("selectedProperty"));
  var propertyId = property.propertyId;
  console.log(property.propertyId);
  // Get the username from localStorage
  var username = localStorage.getItem("username");

  if (!username) {
    alert("You need to be logged in to submit a review");
    return;
  }

  // Send the review data to the backend
  fetch("http://localhost:3004/api/submitReview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      propertyId,
      safety,
      connectivity,
      neighbourhood,
      livability,
      overall,
      text: reviewText,
      username: username, // Send the username with the review
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Review submitted successfully!");
      } else {
        alert("Error: " + data.error);
      }
    })
    .catch((error) => {
      console.error("Error submitting review:", error);
      alert("There was an error submitting the review.");
    });

  // Close the modal after submission
  modal.style.display = "none";
};

// Helper function to get the selected rating for each category
function getSelectedRating(ratingId) {
  const selectedStars = document.querySelectorAll(ratingId + " .star.selected");
  return selectedStars.length > 0 ? selectedStars.length : 0; // Return the count of selected stars (1 to 5)
}

// Fetch reviews for a specific propertyId
async function fetchReviewsForProperty(propertyId) {
  try {
    const response = await fetch(
      `http://localhost:3004/api/reviews/${propertyId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch reviews for property");
    }
    const reviews = await response.json();
    return reviews; // Return the reviews
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return []; // Return an empty array in case of error
  }
}
// Function to format the date to "DD-MMM-YYYY"
function formatDate(date) {
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return new Date(date).toLocaleDateString("en-GB", options).replace(",", ""); // English (UK) formatting
}
async function displayReviews(propertyId) {
  const reviews = await fetchReviewsForProperty(propertyId);
  const reviewsContainer = document.querySelector(".reviews");

  if (!reviewsContainer) {
    console.error("Reviews container not found!");
    return; // Exit early if the container is not found
  }

  // Clear existing reviews if any
  reviewsContainer.innerHTML = "";

  // If there are no reviews, display a message
  if (reviews.length === 0) {
    const noReviewsMessage = document.createElement("div");
    noReviewsMessage.classList.add("no-reviews-message");
    noReviewsMessage.innerText = "No reviews yet!";
    reviewsContainer.appendChild(noReviewsMessage);

    // Update the overall rating section for no reviews
    document.querySelector(".overall-rating .rating-value").innerText = "0.0";
    document.querySelector(".overall-rating .stars").innerHTML = "☆☆☆☆☆";
    document.querySelector(".overall-rating .no-of-reviews").innerText =
      "0 Reviews";

    // Update the individual category ratings for no reviews
    updateCategoryRating(
      ".rating-categories .category:nth-child(1)",
      0,
      "Safety"
    );
    updateCategoryRating(
      ".rating-categories .category:nth-child(2)",
      0,
      "Connectivity"
    );
    updateCategoryRating(
      ".rating-categories .category:nth-child(3)",
      0,
      "Neighbourhood"
    );
    updateCategoryRating(
      ".rating-categories .category:nth-child(4)",
      0,
      "Livability"
    );

    return; // Exit the function early since there are no reviews
  }
  // Reverse the reviews array to show the last review first
  reviews.reverse();

  // Calculate averages for each category if reviews are present
  let totalReviews = reviews.length;
  let totalSafety = 0,
    totalConnectivity = 0,
    totalNeighbourhood = 0,
    totalLivability = 0,
    totalOverall = 0;

  reviews.forEach((review) => {
    totalSafety += review.safety;
    totalConnectivity += review.connectivity;
    totalNeighbourhood += review.neighbourhood;
    totalLivability += review.livability;
    totalOverall += review.overall;

    const reviewElement = document.createElement("div");
    reviewElement.classList.add("review");
    reviewElement.innerHTML = `
      <div class="reviewer-name">${review.username}</div>
      <div class="reviewer-resident">Resident</div>
      <div class="review-rating">${generateStars(review.overall)}</div>
      <div class="review-date">${formatDate(review.timestamp)}</div>
      <p class="review-text">${review.text}</p>
    `;
    reviewsContainer.appendChild(reviewElement);
  });

  // Calculate average ratings
  const avgSafety = (totalSafety / totalReviews).toFixed(1);
  const avgConnectivity = (totalConnectivity / totalReviews).toFixed(1);
  const avgNeighbourhood = (totalNeighbourhood / totalReviews).toFixed(1);
  const avgLivability = (totalLivability / totalReviews).toFixed(1);
  const avgOverall = (totalOverall / totalReviews).toFixed(1);

  // Update the overall rating section
  document.querySelector(".overall-rating .rating-value").innerText =
    avgOverall;
  document.querySelector(
    ".overall-rating .no-of-reviews"
  ).innerText = `${totalReviews} Reviews`;

  // Update the overall rating stars
  document.querySelector(".overall-rating .stars").innerHTML = generateStars(
    parseFloat(avgOverall)
  );

  // Update the individual category ratings
  updateCategoryRating(
    ".rating-categories .category:nth-child(1)",
    avgSafety,
    "Safety"
  );
  updateCategoryRating(
    ".rating-categories .category:nth-child(2)",
    avgConnectivity,
    "Connectivity"
  );
  updateCategoryRating(
    ".rating-categories .category:nth-child(3)",
    avgNeighbourhood,
    "Neighbourhood"
  );
  updateCategoryRating(
    ".rating-categories .category:nth-child(4)",
    avgLivability,
    "Livability"
  );
}

function updateCategoryRating(selector, rating, category) {
  const categoryElement = document.querySelector(selector);
  const ratingElement = categoryElement.querySelector(".score");

  // Show "0/5" if rating is 0 or NaN, and keep the fixed icon
  if (isNaN(rating) || rating === 0) {
    ratingElement.innerText = "0/5";
  } else {
    ratingElement.innerText = `${rating}/5`;
  }
}

function generateStars(rating) {
  let stars = "";
  for (let i = 0; i < 5; i++) {
    stars += i < rating ? "★" : "☆";
  }
  return stars;
}

async function fetchProperties() {
  try {
    const response = await fetch("http://localhost:3001/getAllProperties");
    const properties = await response.json();
    const container = document.getElementById("properties-container");

    properties.forEach((property) => {
      const imageUrl = `JS/${property.firstImage}`; // Image URL

      // Create and append the property card to the container
      const propertyCard = document.createElement("div");
      propertyCard.classList.add("property-card");
      propertyCard.setAttribute("data-property-id", property.propertyId);

      propertyCard.innerHTML = `
        <div class="property-image" style="background-image: url('${imageUrl}');"></div>
        <div class="property-details">
          <div>
            <h2 class="property-title">${property.heading}</h2>
            <p class="property-description">${property.address}, ${property.city}, ${property.state}</p>
          </div>
          <div class="property-info">
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
      `;

      // Add event listener to the property card to redirect to item page
      propertyCard.addEventListener("click", () => {
        // Store the clicked property data in sessionStorage
        sessionStorage.setItem("selectedProperty", JSON.stringify(property));

        // Redirect to item page
        window.location.href = "itemPage.html"; // Assuming itemPage.html exists
      });

      // Append the card to the container
      container.appendChild(propertyCard);
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
  }
}
