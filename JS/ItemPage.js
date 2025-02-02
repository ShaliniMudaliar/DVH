const mainImage = document.getElementById("main-image");
const images = document.querySelectorAll(".product__image");

images.forEach((image) => {
  image.addEventListener("click", (event) => {
    mainImage.src = event.target.src;

    document
      .querySelector(".product__image--active")
      .classList.remove("product__image--active");
    event.target.classList.add("product__image--active");
  });
});

function myFunction() {
  document.getElementById("threeDotDropDown").classList.toggle("show");
}

window.onclick = function (event) {
  if (!event.target.matches(".threeDot")) {
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

window.onload = function () {
  // Retrieve the selected property data from sessionStorage
  const property = JSON.parse(sessionStorage.getItem("selectedProperty"));

  if (property) {
    // Set the main image (first image in the array)
    const mainImage = document.getElementById("main-image");
    if (property.allImage && property.allImage.length > 0) {
      mainImage.src = `JS/${property.allImage[0]}`; // Assuming 'allImage' contains an array of image URLs
    }

    // Render the small images
    const smallImagesContainer = document.querySelector(".product__slider"); // Fixing the selector here
    smallImagesContainer.innerHTML = ""; // Clear the container before adding new images

    property.allImage.forEach((imageUrl, index) => {
      const imageElement = document.createElement("img");
      imageElement.src = `JS/${imageUrl}`; // Assuming image URLs are relative to the JS folder or the correct path
      imageElement.alt = `Property Image ${index + 1}`;
      imageElement.classList.add("product__image");
      smallImagesContainer.appendChild(imageElement);

      // Add event listener to update main image when a small image is clicked
      imageElement.addEventListener("click", (event) => {
        mainImage.src = event.target.src;

        // Remove 'active' class from all images and add it to the clicked image
        const activeImage = document.querySelector(".product__image--active");
        if (activeImage) {
          activeImage.classList.remove("product__image--active");
        }
        event.target.classList.add("product__image--active");
      });
      // Add the active class to the first image
      if (index === 0) {
        imageElement.classList.add("product__image--active");
      }
    });
  } else {
    // In case no property details are found in sessionStorage
    document.querySelector(".product").innerHTML =
      "<p>No property details found.</p>";
  }
};
