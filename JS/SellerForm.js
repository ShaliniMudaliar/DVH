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

// Retrieve email from localStorage
const userEmail = localStorage.getItem("username");

document.getElementById("property-form").onsubmit = function (event) {
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
    formData.append("amenities", JSON.stringify(amenities));

    if (photos instanceof FileList) {
      Array.from(photos).forEach((photo) => {
        formData.append("photos[]", photo);
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

    fetch("http://localhost:3000/api/saveProperty", {
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
};
