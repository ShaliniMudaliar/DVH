// DOM Elements
const form = document.getElementById("form");
const username = document.getElementById("username");
const password = document.getElementById("password");
const forgotPasswordLink = document.getElementById("forgot-password-link");

// Event Listeners
form.addEventListener("submit", (e) => {
  e.preventDefault();
  validateInputs();
});

forgotPasswordLink.addEventListener("click", (e) => {
  e.preventDefault();
  handleForgotPassword();
});

// Helper Functions
const setError = (element, message) => {
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector(".error");
  errorDisplay.innerText = message;
  inputControl.classList.add("error");
};

const setSuccess = (element) => {
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector(".error");
  errorDisplay.innerText = "";
  inputControl.classList.remove("error");
};

const validateEmail = (email) => {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
};

const validateInputs = () => {
  const usernameValue = username.value.trim();
  const passwordValue = password.value.trim();
  let isValid = true;

  // Validate username or email
  if (usernameValue === "") {
    setError(username, "Username or email is required");
    isValid = false;
  } else {
    setSuccess(username);
    localStorage.setItem("username", usernameValue);
  }

  // Validate password
  if (passwordValue === "") {
    setError(password, "Password is required");
    isValid = false;
  } else if (passwordValue.length < 8) {
    setError(password, "Password must be at least 8 characters long");
    isValid = false;
  } else {
    setSuccess(password);
  }

  // If inputs are valid, attempt login
  if (isValid) {
    handleLogin(usernameValue, passwordValue);
  }
};

const handleLogin = async (usernameValue, passwordValue) => {
  try {
    const response = await fetch("http://localhost:8080/login", {
      // Ensure it's 8080
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: usernameValue,
        password: passwordValue,
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      window.location.href = "HomePage.html"; // Redirect to homepage
    } else if (result.message.includes("Incorrect password")) {
      setError(password, result.message); // Show message for password
    } else {
      setError(username, result.message || "Invalid username or password");
    }
  } catch (error) {
    console.error("Error during login:", error);
    setError(password, "Something went wrong. Please try again later.");
  }
};

const handleForgotPassword = async () => {
  const usernameValue = username.value.trim();

  if (!usernameValue) {
    setError(username, "Please enter your username or email before proceeding");
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/check-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: usernameValue }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      const email = result.email; // Get the email from the server response
      localStorage.setItem("email", email); // Store email for the password reset process
      window.location.href = "NewPassword.html"; // Redirect to NewPassword.html
    } else {
      setError(username, result.message || "User not found");
    }
  } catch (error) {
    console.error("Error during forgot password process:", error);
    alert("Something went wrong. Please try again later.");
  }
};
