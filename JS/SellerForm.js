const PortForUrlID = 3003;
const PortForSaveProperty = 3002;
$(document).ready(function () {
  // Initialize select2 for city, state, property type, and facing
  $("#city").select2({
    placeholder: "Select a City",
    allowClear: true,
    tags: true,
  });

  $("#state").select2({
    placeholder: "Select a State",
    allowClear: true,
    tags: true,
  });

  $("#property_type").select2({
    placeholder: "Select Property type",
    allowClear: true,
    tags: true,
  });

  $("#facing").select2({
    placeholder: "Select Facing",
    allowClear: true,
    tags: true,
  });

  // Initialize the toggle for sell or rent
  $("input[name='sellOrRent']").on("change", togglePriceFields);
});

// Toggle price and deposit fields based on selection (Sell or Rent)
function togglePriceFields() {
  var sellRadio = document.getElementById("sell");
  var rentRadio = document.getElementById("rent");
  var priceField = document.getElementById("price");
  var depositField = document.getElementById("deposit");
  var depositLabel = document.getElementById("depositLabel");

  if (sellRadio.checked) {
    priceField.required = true;
    depositField.required = false;
    depositLabel.style.display = "none";
    depositField.style.display = "none";
  } else {
    priceField.required = false;
    depositField.required = true;
    depositLabel.style.display = "inline-block";
    depositField.style.display = "inline-block";
  }
}
// Function to toggle a description item in the textarea
function toggleDescription(checkbox, description) {
  const descriptionList = document.getElementById("finalDescription");
  let currentText = descriptionList.value
    .split("\n")
    .filter((line) => line.trim() !== "");

  if (checkbox.checked) {
    currentText.push(`• ${description}`);
  } else {
    currentText = currentText.filter((item) => item !== `• ${description}`);
  }

  descriptionList.value = currentText.join("\n");
}

// Function to add a custom description directly into the textarea
function addCustomDescription() {
  const customInput = document.getElementById("customDescriptionInput");
  const description = customInput.value.trim();

  if (description) {
    const descriptionList = document.getElementById("finalDescription");
    let currentText = descriptionList.value
      .split("\n")
      .filter((line) => line.trim() !== "");

    currentText.push(`• ${description}`);
    descriptionList.value = currentText.join("\n");

    customInput.value = ""; // Clear the custom input field after adding
  }
}
function checkPhotosLimit() {
  const photosInput = document.getElementById("photos");
  const photoError = document.getElementById("photo-error");
  const imagePreview = document.getElementById("image-preview");
  const files = photosInput.files;

  imagePreview.innerHTML = ""; // Clear previous previews
  photoError.style.display = "none"; // Hide error message initially

  if (files.length > 7) {
    photoError.style.display = "block"; // Show error if files > 7
    photosInput.value = ""; // Clear file input
    return;
  }

  Array.from(files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const imgElement = document.createElement("img");
      imgElement.src = e.target.result;
      imgElement.style.maxWidth = "100px";
      imgElement.style.margin = "5px";
      imagePreview.appendChild(imgElement);
    };
    reader.readAsDataURL(file);
  });
}
// Form validation before submission
function validateForm() {
  // Check if at least one checkbox is checked or if custom description is entered
  var isDescriptionValid = false;
  var checkboxes = document.querySelectorAll(
    '.description-content input[type="checkbox"]'
  );
  for (var checkbox of checkboxes) {
    if (checkbox.checked) {
      isDescriptionValid = true;
      break;
    }
  }

  var customDescription = document
    .getElementById("customDescriptionInput")
    .value.trim();
  if (customDescription !== "") {
    isDescriptionValid = true;
  }

  if (!isDescriptionValid) {
    document.getElementById("descriptionError").style.display = "inline";
    return false;
  }

  document.getElementById("descriptionError").style.display = "none";

  // Validate price as a positive number
  const price = document.getElementById("price").value;
  if (isNaN(price) || price <= 0) {
    alert("Please enter a valid price for the property.");
    return false;
  }

  return true;
}

async function fetchPropertyDetailsForEdit(propertyId) {
  try {
    const response = await fetch(
      `http://localhost:${PortForUrlID}/getPropertyDetailsById?propertyId=${propertyId}`
    );
    const property = await response.json();

    if (!property || !property.photos) {
      alert("Property not found or no photos.");
      return;
    }

    // Fill the form with the fetched property details
    document.getElementById("heading").value = property.heading;
    document.getElementById("finalDescription").value = property.description;
    document.getElementById("price").value = property.price;
    document.getElementById("deposit").value = property.depositAmount;
    document.getElementById("address").value = property.address;
    document.getElementById("city").value = property.city;
    document.getElementById("state").value = property.state;
    document.getElementById("zipcode").value = property.zipcode;
    document.getElementById("property_type").value = property.propertyType;
    document.getElementById("bedrooms").value = property.bedrooms;
    document.getElementById("bathrooms").value = property.bathrooms;
    document.getElementById("year_built").value = property.yearBuilt;
    document.getElementById("square_feet").value = property.squareFeet;
    document.getElementById("floor").value = property.floor;
    document.getElementById("facing").value = property.facing;

    // Trigger select2 change events to update the dropdowns
    $("#city").val(property.city).trigger("change");
    $("#state").val(property.state).trigger("change");
    $("#property_type").val(property.propertyType).trigger("change");
    $("#facing").val(property.facing).trigger("change");

    // Pre-select the amenities
    if (property.amenities && property.amenities.length > 0) {
      property.amenities.forEach((amenity) => {
        const checkbox = document.querySelector(`input[id='${amenity}']`);
        if (checkbox) {
          checkbox.checked = true;
        }
      });
    }
    // Set the sell/rent radio button
    if (property.sellOrRent === "sell") {
      document.getElementById("sell").checked = true;
    } else if (property.sellOrRent === "rent") {
      document.getElementById("rent").checked = true;
    }
    // Call togglePriceFields to adjust price/deposit fields based on the radio button
    togglePriceFields();

    // Display all images from the 'photos' field
    const imagesContainer = document.getElementById("image-preview");
    imagesContainer.innerHTML = ""; // Clear existing images list
    if (property.photos && property.photos.length > 0) {
      property.photos.forEach((imageUrl, index) => {
        const imgElement = document.createElement("img");
        imgElement.src = `JS/${imageUrl}`;
        imgElement.alt = `Image ${index + 1}`;
        imgElement.classList.add("property-image");
        imgElement.style.maxWidth = "100px";
        imgElement.style.margin = "5px";
        imagesContainer.appendChild(imgElement);
      });

      // Do not require new photos if there are already existing photos
      document.getElementById("photos").required = false;
    }
    // const photos = document.getElementById("photos").files;
    if (photos.length === 0) {
      document.getElementById("photos").required = true;
      return;
    }
    // Store the existing photos in a global variable
    window.existingPhotos = property.photos;

    // Set the propertyId for the update operation
    // document.getElementById("property-id").value = property.propertyId;
  } catch (error) {
    console.error("Error fetching property details:", error);
  }
}

window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get("propertyId");

  if (!propertyId) {
    // alert("Property ID is required in the URL.");
    return;
  }

  // console.log("Editing property with ID:", propertyId); // Verify in console
  fetchPropertyDetailsForEdit(propertyId);

  // Attach the submit handler to the form
  // document.getElementById("property-form").onsubmit = function (event) {
  //   event.preventDefault();
  //   handleUpdateSubmit(event, propertyId);
  // };
};

document.getElementById("property-form").onsubmit = function (event) {
  event.preventDefault();

  const propertyId = new URLSearchParams(window.location.search).get(
    "propertyId"
  );

  if (propertyId) {
    console.log(propertyId + "  1");
    // If propertyId exists, update the existing property
    handleUpdateSubmit(event, propertyId);
  } else {
    // Else, create a new property
    handleCreateSubmit(event);
  }
};
const userEmail = localStorage.getItem("username")||localStorage.getItem("email");
async function handleCreateSubmit(event) {
  event.preventDefault();
  if (validateForm()) {
    var amenitiesSelected = document.querySelectorAll(
      'input[name="amenities"]:checked'
    ).length;
    if (amenitiesSelected === 0) {
      document.getElementById("amenitiesError").style.display = "inline";
      return false;
    }
    document.getElementById("amenitiesError").style.display = "none";

    const sellOrRent = document.querySelector(
      'input[name="sellOrRent"]:checked'
    );

    if (!sellOrRent) {
      alert("Please select a property type (Sell or Rent).");
      return;
    }

    const heading = document.getElementById("heading").value;
    const description = document.getElementById("finalDescription").value;
    const address = document.getElementById("address").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const zipcode = document.getElementById("zipcode").value;
    const propertyType = document.getElementById("property_type").value;
    const bedrooms = document.getElementById("bedrooms").value;
    const bathrooms = document.getElementById("bathrooms").value;
    const yearBuilt = document.getElementById("year_built").value;
    const squareFeet = document.getElementById("square_feet").value;
    const floor = document.getElementById("floor").value;
    const facing = document.getElementById("facing").value;
    const price = document.getElementById("price").value;

    const amenities = [];
    document
      .querySelectorAll('input[name="amenities"]:checked')
      .forEach((checkbox) => {
        amenities.push(checkbox.id);
      });

    if (!price || price <= 0) {
      alert("Please enter a valid price for the property.");
      return;
    }

    if (
      !heading ||
      !description ||
      !address ||
      !city ||
      !state ||
      !zipcode ||
      !bedrooms ||
      !bathrooms ||
      !yearBuilt ||
      !squareFeet ||
      !floor ||
      !facing
    ) {
      alert("Please fill out all required fields.");
      return;
    }

    const photos = document.getElementById("photos").files;
    if (photos.length > 7) {
      alert("You can upload a maximum of 7 photos.");
      return;
    }

    const formData = new FormData();
    formData.append("email", userEmail);
    formData.append("heading", heading);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("address", address);
    formData.append("city", city);
    formData.append("state", state);
    formData.append("zipcode", zipcode);
    formData.append("propertyType", propertyType);
    formData.append("bedrooms", bedrooms);
    formData.append("bathrooms", bathrooms);
    formData.append("yearBuilt", yearBuilt);
    formData.append("squareFeet", squareFeet);
    formData.append("floor", floor);
    formData.append("facing", facing);
    formData.append("sellOrRent", sellOrRent.value);
    formData.append("amenities", JSON.stringify(amenities));

    if (photos instanceof FileList) {
      Array.from(photos).forEach((photo) => {
        formData.append("photos", photo);
      });
    }

    if (sellOrRent.value === "rent") {
      const depositAmount = document.getElementById("deposit").value;
      if (!depositAmount || depositAmount <= 0) {
        alert("Please enter a valid deposit amount for the property.");
        return;
      }
      formData.append("depositAmount", depositAmount);
    }

    fetch(`http://localhost:${PortForSaveProperty}/api/saveProperty`, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json(); // Parse JSON
      })
      .then((data) => {
        console.log("Property data saved successfully:", data);
        // alert("Property saved successfully!");
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(`There was an error saving the property: ${error.message}`);
      });
  }
}

async function handleUpdateSubmit(event, propertyId) {
  event.preventDefault(); // Prevent default form submission

  const formData = new FormData();
  const heading = document.getElementById("heading").value;
  const description = document.getElementById("finalDescription").value;
  const price = document.getElementById("price").value;
  const address = document.getElementById("address").value;
  const city = document.getElementById("city").value;
  const state = document.getElementById("state").value;
  const zipcode = document.getElementById("zipcode").value;
  const propertyType = document.getElementById("property_type").value;
  const bedrooms = document.getElementById("bedrooms").value;
  const bathrooms = document.getElementById("bathrooms").value;
  const yearBuilt = document.getElementById("year_built").value;
  const squareFeet = document.getElementById("square_feet").value;
  const floor = document.getElementById("floor").value;
  const facing = document.getElementById("facing").value;
  const sellOrRent = document.querySelector('input[name="sellOrRent"]:checked');

  // Collect amenities
  const amenities = [];
  document
    .querySelectorAll('input[name="amenities"]:checked')
    .forEach((checkbox) => amenities.push(checkbox.id));

  // Append data to formData
  formData.append("propertyId", propertyId);
  formData.append("heading", heading);
  formData.append("description", description);
  formData.append("price", price);
  formData.append("address", address);
  formData.append("city", city);
  formData.append("state", state);
  formData.append("zipcode", zipcode);
  formData.append("propertyType", propertyType);
  formData.append("bedrooms", bedrooms);
  formData.append("bathrooms", bathrooms);
  formData.append("yearBuilt", yearBuilt);
  formData.append("squareFeet", squareFeet);
  formData.append("floor", floor);
  formData.append("facing", facing);
  formData.append("sellOrRent", sellOrRent.value);
  formData.append("amenities", JSON.stringify(amenities));

  // If the property is for rent, append the deposit amount
  if (sellOrRent.value === "rent") {
    const depositAmount = document.getElementById("deposit").value;
    if (!depositAmount || depositAmount <= 0) {
      alert("Please enter a valid deposit amount for the property.");
      return;
    }
    formData.append("depositAmount", depositAmount);
  }

  // Check if new photos were uploaded
  const photos = document.getElementById("photos").files;
  if (photos.length > 0) {
    Array.from(photos).forEach((photo) => {
      formData.append("photos[]", photo);
    });
  }

  try {
    const response = await fetch(
      `http://localhost:${PortForUrlID}/updateProperty/${propertyId}`,
      {
        method: "PUT", // Using PUT for updating
        body: formData,
      }
    );

    const text = await response.text(); // Get raw response text
    console.log("Raw response:", text); // Log raw response

    if (!response.ok) {
      // If the response status is not OK, it means there was an error
      throw new Error("Error updating property: " + text);
    }

    // Try parsing the response as JSON
    let data;
    try {
      data = JSON.parse(text); // Parse the JSON if the response is JSON
      console.log("Response data:", data);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      alert("Failed to parse server response.");
      return;
    }

    // Check the success message and redirect
    if (data.message === "Property updated successfully") {
      window.location.href = "SellerHomePage.html"; // Redirect after successful update
    } else {
      console.error("Update failed:", data.message);
      alert("Update failed: " + data.message);
    }
  } catch (error) {
    console.error("Error updating property:", error);
    alert("An error occurred while updating the property.");
  }
}
