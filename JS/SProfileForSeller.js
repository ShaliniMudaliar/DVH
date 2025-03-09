// Prefill email field from localStorage or default value
document.addEventListener("DOMContentLoaded", async function () {
  const emailField = document.getElementById("email");
  const emailOrUsername = localStorage.getItem("username");

  if (!emailOrUsername) {
    console.error("emailOrUsername not found in localStorage");
    return;
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:5000/api/getUser?emailOrUsername=${emailOrUsername}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log("Response status:", response.status);
    if (!response.ok) {
      throw new Error("Failed to fetch user details");
    }
    const data = await response.json();
    console.log("Fetched user details:", data);
    emailField.value = data.email;
    emailField.readOnly = true; // Set as readonly
    // Store UserID and email in localStorage for later use in seller data
    localStorage.setItem("UserID", data.userID || data.UserID);
    localStorage.setItem("email", data.email || data.Email);
  } catch (error) {
    console.error("Error fetching user details:", error);
  }
  makeFormEditable();
});

function validateForm() {
  let isValid = true;

  // Regex patterns
  const nameRegex = /^[a-zA-Z\s]+$/; // letters and spaces
  const phoneRegex = /^\d{10}$/; // 10-digit numbers
  const ageRegex = /^(1[89]|[2-9]\d|1[01]\d|100)$/; // 18-100
  const pinCodeRegex = /^\d{6}$/; // 6-digit numbers

  // Define all form fields with their fieldName (for error messages)
  const formElements = [
    { id: "first-name", fieldName: "First Name" },
    { id: "last-name", fieldName: "Last Name" },
    { id: "contact-number", fieldName: "Contact Number" },
    { id: "age", fieldName: "Age" },
    { id: "address", fieldName: "Address" },
    { id: "city", fieldName: "City" },
    { id: "state", fieldName: "State" },
    { id: "country", fieldName: "Country" },
    { id: "zip-code", fieldName: "Pin Code" },
  ];

  // Clear errors, then validate each field
  formElements.forEach(({ id, fieldName }) => {
    const input = document.getElementById(id);
    clearError(input); // Clear any previous error
    const value = input.value.trim();

    // 1. Check if empty
    if (!value) {
      showError(input, `${fieldName} is required`);
      isValid = false;
    } else {
      // 2. Field-specific validation
      switch (id) {
        case "first-name":
        case "last-name":
          if (!nameRegex.test(value)) {
            showError(input, `${fieldName} must contain letters only`);
            isValid = false;
          }
          break;

        case "contact-number":
          if (!phoneRegex.test(value)) {
            showError(input, `${fieldName} must be 10 digits`);
            isValid = false;
          }
          break;

        case "age":
          if (!ageRegex.test(value)) {
            showError(input, `${fieldName} must be between 18 and 100`);
            isValid = false;
          }
          break;

        case "address":
          break;

        case "city":
        case "state":
        case "country":
          if (!nameRegex.test(value)) {
            showError(input, `${fieldName} must contain letters only`);
            isValid = false;
          }
          break;

        case "zip-code":
          if (!pinCodeRegex.test(value)) {
            showError(input, `Please enter a valid 6-digit ${fieldName}`);
            isValid = false;
          }
          break;

        default:
          // No extra validation for this field
          break;
      }
    }
  });

  // Validate Agent-specific fields if "Agent" is selected
  const agentRadio = document.querySelector('input[name="Agent"]:checked');
  if (agentRadio && agentRadio.value === "Agent") {
    // e.g., "description", "Agency", "AgentLicense", "TaxNumber"
    const description = document.getElementById("description");
    const agency = document.getElementById("Agency");
    const agentLicense = document.getElementById("AgentLicense");
    const taxNumber = document.getElementById("TaxNumber");

    // Clear errors
    clearError(description);
    clearError(agency);
    clearError(agentLicense);
    clearError(taxNumber);

    // Check each field
    if (!description.value.trim()) {
      showError(description, "Agent Description cannot be empty.");
      isValid = false;
    }
    if (!agency.value.trim()) {
      showError(agency, "Agency name cannot be empty.");
      isValid = false;
    }
    if (!agentLicense.value.trim()) {
      showError(agentLicense, "Please enter a valid Agent License.");
      isValid = false;
    }
    if (!taxNumber.value.trim()) {
      showError(taxNumber, "Tax Number cannot be empty.");
      isValid = false;
    } else if (!/^\d+$/.test(taxNumber.value.trim())) {
      showError(taxNumber, "Tax Number must be numeric.");
      isValid = false;
    }
  }

  // Validate Password (example: at least 8 chars)
  const passwordInput = document.getElementById("password");
  clearError(passwordInput);
  const passwordValue = passwordInput.value.trim();
  if (!passwordValue) {
    showError(passwordInput, "Password is required");
    isValid = false;
  } else if (passwordValue.length < 8) {
    showError(passwordInput, "Password must be at least 8 characters long");
    isValid = false;
  }

  return isValid;
}

function showError(input, message) {
  const parent = input.parentElement;
  const errorDiv = parent.querySelector(".error");
  if (errorDiv) {
    errorDiv.innerText = message;
  }
  input.classList.add("error");
}

function clearError(input) {
  const parent = input.parentElement;
  const errorDiv = parent.querySelector(".error");
  if (errorDiv) {
    errorDiv.innerText = "";
  }
  input.classList.remove("error");
}

// Attach form validation to submit event
document.querySelector("form").addEventListener("submit", function (event) {
  if (!validateForm()) {
    event.preventDefault(); // Prevent form submission if validation fails
  }
});

document.getElementById("edit-save-btn").addEventListener("click", function () {
  if (validateForm()) {
    saveDetails();
  }
});

// Toggle Agent-specific fields visibility
function toggleFields() {
  const isAgent = document.getElementById("Agent").checked;
  const agentFields = document.getElementById("AgentList");
  agentFields.classList.toggle("hidden", !isAgent);
  agentFields.classList.toggle("show", isAgent);
}
toggleFields();

// Toggle edit/save functionality
function toggleEditSave() {
  const button = document.getElementById("edit-save-btn");
  if (button.innerText === "Save") {
    if (validateForm()) {
      saveDetails();
      makeFormNonEditable();
      button.innerText = "Edit";
    }
  } else {
    makeFormEditable();
    button.innerText = "Save";
  }
}

// Make form fields non-editable
function makeFormNonEditable() {
  const inputs = document.querySelectorAll(
    ".profile-form input:not([readonly])"
  );
  inputs.forEach((input) => input.setAttribute("disabled", true));
}

// Make form fields editable
function makeFormEditable() {
  const inputs = document.querySelectorAll(
    ".profile-form input:not([readonly])"
  );
  inputs.forEach((input) => input.removeAttribute("disabled"));
}

function saveDetails() {
  const firstName = document.getElementById("first-name").value;
  const lastName = document.getElementById("last-name").value;
  const contactNumber = document.getElementById("contact-number").value;
  const age = document.getElementById("age").value;
  const address = document.getElementById("address").value;
  const city = document.getElementById("city").value;
  const state = document.getElementById("state").value;
  const country = document.getElementById("country").value;
  const zipCode = document.getElementById("zip-code").value;
  const password = document.getElementById("password").value;

  // Retrieve emailOrUsername from localStorage
  const emailOrUsername = localStorage.getItem("email");
  const userID = localStorage.getItem("UserID");
  const email = localStorage.getItem("email");

  let agentData = {};
  const isAgent =
    document.getElementById("Agent") &&
    document.getElementById("Agent").checked;
  if (isAgent) {
    agentData = {
      description: document.getElementById("description").value,
      agency: document.getElementById("Agency").value,
      agentLicense: document.getElementById("AgentLicense").value,
      taxNumber: document.getElementById("TaxNumber").value,
    };
  } else {
    agentData = null; // Or leave it undefined if you prefer
  }

  const formData = {
    firstName,
    lastName,
    emailOrUsername,
    userID, // Added from localStorage
    email,
    contactNumber,
    age,
    address,
    city,
    state,
    country,
    zipCode,
    password,
    agentData,
  };

  // Sending data to backend (assuming you have a POST API endpoint)
  fetch("http://127.0.0.1:5000/api/seller", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Success:", data);
      // Handle success (e.g., show a success message or redirect)
      alert("Seller details saved successfully!");
      // Redirect to homepage after 1.5 seconds
      setTimeout(() => {
        window.location.href = "SellerHomepage.html"; // Update to your actual homepage URL
      }, 1500);
    })
    .catch((error) => {
      console.error("Error:", error);
      // Handle error (e.g., show an error message)
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
