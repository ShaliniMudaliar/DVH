
const form = document.getElementById("form");
const username = document.getElementById("username");
const password = document.getElementById("password");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  validateInputs();
});

const setError = (element, message) => {
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector(".error");

  errorDisplay.innerText = message; // Set the error message
  inputControl.classList.add("error"); // Add error styles
};

const setSuccess = (element) => {
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector(".error");

  errorDisplay.innerText = ""; // Clear any error messages
  inputControl.classList.remove("error"); // Remove error styles
};

const validateInputs = () => {
  const usernameValue = username.value.trim();
  const passwordValue = password.value.trim();


  let isValid = true;

  // Validate username or email
  if (usernameValue === "") {
    setError(username, "Username or email is required");
    isValid = false;
  } else if (!validateEmail(usernameValue) && usernameValue.length < 3) {
    setError(username, "Enter a valid email or username with at least 3 characters");
    isValid = false;
  } else {
    setSuccess(username);
  }
  // Validate password
  if (passwordValue === "") {
    setError(password, "Password is required");
    isValid = false;
  } else if (passwordValue.length < 8) {
    setError(password, "Password must be longer than 8 characters");
    isValid = false;
  } else {
    setSuccess(password);
  }

  // If all inputs are valid, proceed with login
  if (isValid) {
    handleLogin(usernameValue, passwordValue);
  }
};

const handleLogin = async (usernameValue, passwordValue) => {
  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: usernameValue, password: passwordValue }),
    });
    console.log("Username: ", usernameValue);
    console.log("Password: ", passwordValue);

    const result = await response.json();
    console.log(result); 
    
    if (response.ok && result.success) {
      // Store user data in localStorage
      // const { username, email } = result.user;
      // localStorage.setItem("username", username);
      // localStorage.setItem("email", email);
      // alert("Login successful! Redirecting...");
      window.location.href = "HomePage.html"; // Redirect to homepage
    } else {
      if (result.errorType === "invalid_password") {
        setError(password, "Invalid password.");
      } else {
        setError(username, result.message || "User not found.");
      }
    }
  } catch (error) {
    console.error("Error:", error);
    setError(password, "Something went wrong. Please try again later.");
  }
};

// Helper function to validate email format
const validateEmail = (email) => {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
};




document.getElementById("forgot-password-link").addEventListener("click", function(e) {
  e.preventDefault();  // Prevent default anchor behavior

  // Get the email from the user (prompt or from stored data)
  const email = prompt("Please enter your email:");

  if (!email) {
    alert("Email is required!");
    return;
  }

  // Send OTP request
  fetch("http://localhost:8080/send-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email }),
  })
  .then((response) => response.json())
  .then((data) => {
    if (data.success) {
      alert("OTP sent to your email.");
      // Store the email in localStorage to use later in newpassword.html
      localStorage.setItem("email", email);
      // Redirect to newpassword.html
      window.location.href = "NewPassword.html";
    } else {
      alert("Failed to send OTP: " + data.message);
    }
  })
  .catch((error) => {
    console.error("Error:", error);
    alert("There was an error sending the OTP.");
  });
});





document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("reset-password-form");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    showMessage(message);

    const otp = document.getElementById("otp").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const email = localStorage.getItem("email"); // Email stored earlier

    if (!email) {
      showMessage("Email not found. Please try again.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("Passwords do not match.");
      return;
    }

    // Verify OTP and reset the password
    fetch("http://localhost:8080/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp, newPassword }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Password reset successfully!", true);
          window.location.href = "Login.html";
        } else {
          showMessage("Error: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        showMessage("There was an error resetting the password.");
      });
  });
});

function showMessage(message, isSuccess = false) {
      const messageContainer = document.getElementById("message-container");
      
      // Clear previous messages
      messageContainer.innerHTML = '';
      
      const messageElement = document.createElement("div");
      messageElement.textContent = message;
      
      if (isSuccess) {
        messageElement.style.color = "green"; // Green for success
        messageElement.style.fontWeight = "bold";
      } else {
        messageElement.style.color = "red"; // Red for errors
      }
    
      // Append the message to the container
      messageContainer.appendChild(messageElement);
    }
    



