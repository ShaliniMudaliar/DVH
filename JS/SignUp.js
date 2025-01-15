const form = document.getElementById("form");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
let uname = true;
let em = true;
let pass = true;
document.addEventListener("DOMContentLoaded", function () {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Perform email validation
    validateEmail();

    // If the email is valid, check if it exists in the database
    if (em === true) {
      const emailValue = email.value.trim();
      const usernameValue = username.value.trim();
      Promise.all([
        checkEmailExistence(emailValue),
        checkUsernameExistence(usernameValue),
      ])
        .then(([emailExists, usernameExists]) => {
          if (emailExists) {
            setError(email, "Email is already taken");
            em = false;
          } else if (usernameExists) {
            setError(username, "Username is already taken");
            uname = false;
          } else {
            // If email doesn't exist, proceed with other field validations
            validateInputs();

            if (uname === true && em === true && pass === true) {
              // const usernameValue = username.value.trim();
              const passwordValue = password.value.trim();

              // Store user data in localStorage
              localStorage.setItem("username", usernameValue);
              localStorage.setItem("email", emailValue);
              localStorage.setItem("password", passwordValue);

              // Redirect to OTP page
              window.location.assign("Otp.html");

              // Send the email to the backend to request OTP only if email check is successful
              fetch("http://localhost:3000/send-otp", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: emailValue }),
              })
                .then((response) => response.json())
                .then((data) => {
                  if (data.success) {
                    console.log("Email sent successfully.");
                    // Redirect to OTP page
                    // window.location.assign("Otp.html");
                  } else {
                    alert("Error sending OTP: " + data.message);
                  }
                })
                .catch((error) => {
                  console.error("Error:", error);
                  alert("There was an error requesting the OTP.");
                });
            }
          }
        })
        .catch((error) => {
          console.error("Error checking email existence:", error);
          alert("There was an error checking if the email exists.");
        });
    }
  });
});

// Function to check if the email already exists
const checkEmailExistence = async (email) => {
  try {
    const response = await fetch("http://localhost:8080/check-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    });
    const data = await response.json();
    return data.exists; // Backend should return { exists: true/false }
  } catch (error) {
    console.error("Error checking email existence:", error);
    throw new Error("Network or server error"); // Throw error to catch in the caller
  }
};

// Function to check if the username already exists
const checkUsernameExistence = async (username) => {
  try {
    const response = await fetch("http://localhost:8080/check-username", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username }),
    });
    const data = await response.json();
    return data.exists; // Backend should return { exists: true/false }
  } catch (error) {
    console.error("Error checking username existence:", error);
    throw new Error("Network or server error"); // Throw error to catch in the caller
  }
};

// Email Validation function
const validateEmail = () => {
  const emailValue = email.value.trim();

  // If email is empty
  if (emailValue === "") {
    setError(email, "Email is required");
    em = false;
  } else if (!isValidEmail(emailValue)) {
    // If email is invalid
    setError(email, "Provide a valid email address");
    em = false;
  } else {
    // If email is valid, reset any previous errors
    setSuccess(email);
    em = true;
  }
};

// Validation function for username and password
const validateInputs = () => {
  const usernameValue = username.value.trim();
  const passwordValue = password.value.trim();

  if (usernameValue === "") {
    setError(username, "Username is required");
    uname = false;
  } else if (usernameValue.length < 3) {
    setError(username, "Username must be at least 3 characters.");
    uname = false;
  } else {
    setSuccess(username);
    uname = true;
  }

  // Validate password
  if (passwordValue === "") {
    setError(password, "Password is required");
    pass = false;
  } else if (passwordValue.length < 8) {
    setError(password, "Password must be at least 8 characters.");
    pass = false;
  } else {
    setSuccess(password);
    pass = true;
  }
};

// Utility function to check if email is valid
const isValidEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// Set error and success messages
const setError = (element, message) => {
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector(".error");
  errorDisplay.innerText = message;
  inputControl.classList.add("error");
  // inputControl.classList.add("label");
};

const setSuccess = (element) => {
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector(".error");
  errorDisplay.innerText = "";
  inputControl.classList.remove("error");
  // inputControl.classList.remove("label");
};

// Verify OTP and send user data to backend
document.getElementById("verify-otp").addEventListener("click", function () {
  const otp = document.getElementById("otp").value;

  // Send OTP to the backend to verify it
  fetch("http://localhost:3000/verify-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ otp: otp }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // OTP is verified, now send user registration data
        const usernameValue = localStorage.getItem("username");
        const emailValue = localStorage.getItem("email");
        const passwordValue = localStorage.getItem("password");

        // Send the user details to register
        fetch("http://localhost:8080/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: usernameValue,
            email: emailValue,
            password: passwordValue,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              window.location.assign("Choose.html"); // Example redirect
              localStorage.removeItem("email");
              localStorage.removeItem("password");
            } else {
              alert("Registration failed: " + data.message);
            }
          })
          .catch((error) => {
            console.error("Error during registration:", error);
            alert("There was an error during registration.");
          });
      } else {
        document.querySelector(".msgForOtp").innerText = data.message;
        document.querySelector(".msgForOtp").style.backgroundColor = "#de9b9b";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("There was an error verifying the OTP.");
    });
});
