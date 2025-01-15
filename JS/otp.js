const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

let generatedOtp = null; // To store the OTP temporarily

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Allow all CORS requests

// Route to send OTP
app.post("/send-otp", (req, res) => {
  const email = req.body.email;

  // Generate a random 6-digit OTP
  generatedOtp = Math.floor(100000 + Math.random() * 900000);

  // Configure nodemailer transport (using Gmail in this case)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "dreamviewhouserealestate@gmail.com", // Replace with your email
      pass: "njmanyyvnohheyco", // Use app password if 2FA is enabled
    },
  });

  // Email options
  const mailOptions = {
    from: "dreamviewhouserealestate@gmail.com",
    to: email,
    subject: "OTP Verification for Dream View House Real Estate",
    text: `Thank you for choosing Dream View House Real Estate. To complete your request, please use the One-Time Password (OTP) below to verify your identity:
Your OTP:  ${generatedOtp}
This OTP is valid for the next 10 minutes. If you did not request this verification, please ignore this message.
If you have any questions or need assistance, feel free to contact us.
Best regards,
The Dream View House Real Estate Team`,
  };

  // Send OTP email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res
        .status(500)
        .json({ success: false, message: "Error sending OTP." });
    }
    res.status(200).json({ success: true, message: "OTP sent successfully." });
  });
});

// Route to verify OTP
app.post("/verify-otp", (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res
      .status(400)
      .json({ success: false, message: "OTP is required." });
  }

  if (parseInt(otp) === generatedOtp) {
    res
      .status(200)
      .json({ success: true, message: "OTP verified successfully." });
  } else {
    res.status(400).json({ success: false, message: "Invalid OTP." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
