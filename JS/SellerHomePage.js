// Function to get property details from the backend
async function fetchPropertyDetails() {
  const emailOrUsername =
    localStorage.getItem("email") || localStorage.getItem("username"); // Get the email/username from localStorage

  if (!emailOrUsername) {
    alert("No email or username found in localStorage.");
    return;
  }

  try {
    // Fetch the property details from the backend using the email/username
    const response = await fetch(
      `http://localhost:3000/getPropertyDetails?emailOrUsername=${emailOrUsername}`
    );

    // Check if the response is successful
    if (!response.ok) {
      throw new Error("Failed to fetch property details");
    }

    const propertyData = await response.json();
    console.log(propertyData);
    // If no property data is found, show an appropriate message
    if (propertyData.length === 0) {
      document.getElementById("property-card").innerHTML =
        "<p>No properties found for this user.</p>";
      return;
    }
    // Clear any existing property cards
    const propertyContainer = document.querySelector(".propertyContainer");
    propertyContainer.innerHTML = "";
    // Loop through each property and create the property card
    propertyData.forEach((property) => {
      // Construct image URL
      const imageUrl = `JS/${property.firstImage}`;
      console.log(`Image URL: ${imageUrl}`);

      // Dynamically create and insert the property card into the page
      propertyContainer.innerHTML += `
      <div class="property-card">
        <div class="property-image" style="background-image: url('${imageUrl}');"></div>
        <div class="property-details">
          <div>
            <h2 class="property-title">${property.heading}</h2>
            <p class="property-description">${property.address}, ${property.city}, ${property.state}</p>
          </div>
          <div class="property-info">
            <div class="property-icons">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
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
            <div class="property-date">
              <a href="SellerForm.html?propertyId=${property.propertyId}" class="edit-button">
                <div><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" width="17px">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/>
                </svg>
                </div>
                <div>Edit</div>
              </a>
              <div>Posted: ${property.createdAtAgo}</div>
            </div>
          </div>
        </div>
      </div>
    `;
    });
    // console.log(property.propertyId);
    // Add event listener for editing the property
    const editButtons = document.querySelectorAll(".edit-button");
    editButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const propertyId = event.target
          .closest(".edit-button")
          .getAttribute("data-id");
        openEditForm(propertyId);
      });
    });
  } catch (error) {
    console.error("Error fetching property details:", error);
    document.querySelector(".propertyContainer").innerHTML =
      "<p>Error loading property details. Please try again later.</p>";
  }
}

// Function to open the edit form with the property details
async function openEditForm(propertyId) {
  // Get the propertyId from the URL query parameters
  // const urlParams = new URLSearchParams(window.location.search);
  // const propertyId = urlParams.get("propertyId"); // Extract propertyId from the URL

  // if (!propertyId) {
  //   alert("No property ID found in the URL.");
  //   return;
  // }

  const response = await fetch(
    `http://localhost:3000/getPropertyDetailsById?id=${propertyId}`
  );
  const property = await response.json();

  if (property) {
    // Populate the edit form with the property details
    document.getElementById("property-heading").value = property.heading;
    document.getElementById("property-address").value = property.address;
    document.getElementById("property-city").value = property.city;
    document.getElementById("property-state").value = property.state;
    document.getElementById("property-price").value = property.price;

    // Set the property ID for later use
    document.getElementById("edit-property-id").value = property._id;

    // Show the edit form
    document.getElementById("edit-property-form").style.display = "block";
  }
}

// Call the function to fetch and display the property details when the page loads
window.onload = fetchPropertyDetails;
