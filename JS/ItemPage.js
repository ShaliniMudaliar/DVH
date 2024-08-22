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

// Close the dropdown menu if the user clicks outside of it
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
