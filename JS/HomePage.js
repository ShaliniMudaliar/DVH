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
  }, 4000); // Slide changes every 10 seconds

  // Listen for keyboard events
  document.addEventListener("keydown", handleKeydown);
});

function myFunction() {
  document.getElementById("filter").classList.toggle("show");
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
