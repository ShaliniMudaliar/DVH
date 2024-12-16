
const express=require("express");
const nodemailer=require("nodemailer");
const bodyParser=require("body-parser");
const cors=require("cors");

const app=express();
app.use(cors());
app.use(bodyParser.json());





// function showMessage(message, isSuccess = false) {
//     const messageContainer = document.getElementById("message-container");
    
//     // Clear previous messages
//     messageContainer.innerHTML = '';
    
//     const messageElement = document.createElement("div");
//     messageElement.textContent = message;
    
//     if (isSuccess) {
//       messageElement.style.color = "green"; // Green for success
//       messageElement.style.fontWeight = "bold";
//     } else {
//       messageElement.style.color = "red"; // Red for errors
//     }
  
//     // Append the message to the container
//     messageContainer.appendChild(messageElement);
//   }
  


  
// Store OTP temporarily (You can store this more securely in production, e.g., in the database)
let otpStore = {};

// Route to send OTP (this will be called on the frontend)
app.post("/send-otp", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  // Generate OTP (6-digit)
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  console.log('Generated OTP:', otp); 

  // Store OTP in memory with an expiry time (10 minutes)
  otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

  // Send OTP to user's email
  sendOtpEmail(email, otp);

  // Respond with success message
  res.status(200).json({ success: true, message: 'OTP sent to email.' });
});

// Function to send OTP email
const sendOtpEmail = (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "dreamviewhouserealestate@gmail.com", // Replace with your email
      pass: "njmanyyvnohheyco", // Use app password if 2FA is enabled
    },
  });

  const mailOptions = {
    from: 'dreamviewhouserealestate@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP for password reset is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending OTP email:', error);
    } else {
      console.log('OTP sent: ' + info.response);
    }
  });
};







// document.addEventListener("DOMContentLoaded", function () {
//     const form = document.getElementById("reset-password-form");
  
//     form.addEventListener("submit", function (e) {
//       e.preventDefault();
  
//       const otp = document.getElementById("otp").value.trim();
//       const newPassword = document.getElementById("newPassword").value.trim();
//       const confirmPassword = document.getElementById("confirmPassword").value.trim();
//       const email = localStorage.getItem("email"); // Email stored earlier
  
//       if (!email) {
//         showMessage("Email not found. Please try again.");
//         return;
//       }
  
//       if (newPassword !== confirmPassword) {
//         showMessage("Passwords do not match.");
//         return;
//       }
  
//       // Verify OTP and reset the password
//       fetch("http://localhost:8080/reset-password", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, otp, newPassword }),
//       })
//         .then((response) => response.json())
//         .then((data) => {
//           if (data.success) {
//             alert("Password reset successfully!", true);
//             window.location.href = "Login.html";
//           } else {
//             showMessage("Error: " + data.message);
//           }
//         })
//         .catch((error) => {
//           console.error("Error:", error);
//           showMessage("There was an error resetting the password.");
//         });
//     });
//   });
  
app.listen(3000,()=>{
    console.log("Connected...");
});

