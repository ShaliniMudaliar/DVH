const email = localStorage.getItem("email"); // Get the email from localStorage
const otpInput = document.getElementById("otp");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");

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
// Send OTP Function
const sendOtp = async () => {
  try {
    const response = await fetch("http://localhost:8080/send-otp", {
      // Backend on port 8080
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    if (response.ok && result.success) {
      // alert(result.message);
    } else {
      alert(result.message || "Failed to send OTP.");
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    alert("Something went wrong. Please try again later.");
  }
};

// Validate and reset password
const resetPassword = async (event) => {
  event.preventDefault(); //
  const otp = parseInt(otpInput.value.trim()); // Get the OTP from the user input
  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  // if (!newPassword || !confirmPassword) {
  //   // alert("Please fill in both fields.");
  //   return;
  // }

  // if (newPassword !== confirmPassword) {
  //   alert("Passwords do not match.");
  //   return;
  // }

  try {
    const response = await fetch("http://localhost:8080/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        otp,
        newPassword,
      }),
    });
    let isValid = true;

    // Validate OTP field
    if (!otp) {
      setError(otpInput, "OTP is required.");
      isValid = false;
    } else {
      setSuccess(otpInput);
    }

    // Validate newPassword field
    if (!newPassword) {
      setError(newPasswordInput, "New password is required.");
      isValid = false;
    } else if (newPassword.length < 8) {
      setError(newPasswordInput, "Password must be at least 8 characters.");
      isValid = false;
    } else {
      setSuccess(newPasswordInput);
    }

    // Validate confirmPassword field
    if (!confirmPassword) {
      setError(confirmPasswordInput, "Confirm password is required.");
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setError(confirmPasswordInput, "Passwords do not match.");
      isValid = false;
    } else {
      setSuccess(confirmPasswordInput);
    }

    // If validation fails, return early
    if (!isValid) {
      return;
    }
    const result = await response.json();
    console.log(result);
    if (response.ok && result.success) {
      window.location.href = "Login.html"; // Redirect to login
    } else if (result.message.includes("Incorrect OTP.")) {
      document.querySelector(".msgForOtp").innerText = result.message;
      document.querySelector(".msgForOtp").style.backgroundColor = "#de9b9b";
    } else {
      alert(result.message || "Failed to reset password.");
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    // alert("Something went wrong. Please try again later.");
  }
};

// Event listener for password reset
document
  .getElementById("reset-button")
  .addEventListener("click", resetPassword);

// Send OTP when page loads (optional)
sendOtp();
