function toggleEditSave() {
  const inputs = document.querySelectorAll(
    ".profile-form input:not([readonly])"
  );
  const button = document.getElementById("edit-save-btn");
  const form = document.getElementById("profileForm");
  if (button.innerText === "Save") {
    if (form.checkValidity()) {
      inputs.forEach((input) => (input.disabled = true));
      button.innerText = "Edit";
      saveDetails();
    } else {
      form.reportValidity();
    }
  } else {
    inputs.forEach((input) => (input.disabled = false));
    button.innerText = "Save";
  }
}

function saveDetails() {
  const firstName = document.getElementById("first-name").value;
  const lastName = document.getElementById("last-name").value;
  const description = document.getElementById("description").value;
  const contactNumber = document.getElementById("contact-number").value;
  const address = document.getElementById("address").value;
  const city = document.getElementById("city").value;
  const state = document.getElementById("state").value;
  const country = document.getElementById("country").value;
  const zipCode = document.getElementById("zip-code").value;
  const password = document.getElementById("password").value;

  console.log({
    firstName,
    lastName,
    email,
    contactNumber,
    description,
    address,
    city,
    state,
    country,
    zipCode,
    password,
  });
}

function togglePasswordVisibility(inputId) {
  const passwordInput = document.getElementById(inputId);
  const toggleIcon = passwordInput.nextElementSibling;

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.classList.remove("fa-eye");
    toggleIcon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    toggleIcon.classList.remove("fa-eye-slash");
    toggleIcon.classList.add("fa-eye");
  }
}

function previewProfilePic(event) {
  const profilePic = document.getElementById("profile-pic-preview");
  profilePic.src = URL.createObjectURL(event.target.files[0]);
  profilePic.onload = () => {
    URL.revokeObjectURL(profilePic.src);
  };
}

function toggleFields() {
  const AgentRadio = document.getElementById("Agent");
  if (AgentRadio.checked) {
    document.getElementById("AgentList").classList.add("show");
    document.getElementById("AgentList").classList.remove("hidden");
  } else {
    document.getElementById("AgentList").classList.remove("show");
    document.getElementById("AgentList").classList.add("hidden");
  }
}
toggleFields();

function chatFunction() {
  document.getElementById("chooseChat").classList.toggle("show");
}

window.onclick = function (event) {
  if (!event.target.matches(".item")) {
    var dropdowns = document.getElementsByClassName("hidden");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};
