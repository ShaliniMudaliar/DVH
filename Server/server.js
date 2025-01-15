import express from "express";
import mysql from "mysql";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    // origin: ["http://127.0.0.1:3000"], // Frontend running on port 3000
    origin: "*", // Allow all origins for testing
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(bodyParser.json());

// Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "account",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL Database");
  }
});

// Send OTP Email Helper
const sendOtpEmail = (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "dreamviewhouserealestate@gmail.com", // Replace with your email
      pass: "njmanyyvnohheyco", // Use app password if 2FA is enabled
    },
  });

  const mailOptions = {
    from: "dreamviewhouserealestate@gmail.com", // Your email address
    to: email,
    subject: "Your OTP Code",
    text: `Thank you for choosing Dream View House Real Estate. To complete your request, please use the One-Time Password (OTP) below to verify your identity:
Your OTP:  ${otp}
This OTP is valid for the next 10 minutes. If you did not request this verification, please ignore this message.
If you have any questions or need assistance, feel free to contact us.
Best regards,
The Dream View House Real Estate Team`,
  };

  return transporter.sendMail(mailOptions);
};

// Temporary OTP store with expiration logic (expires after 10 minutes)
let otpStore = {};

// Send OTP Route
app.post("/send-otp", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required." });
  }

  // Query the database to check if the user exists by email
  const query = "SELECT * FROM user WHERE Email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // User found, send email with OTP
    const user = results[0];
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate OTP
    console.log("Generated OTP for password reset:", otp);

    // Send OTP to the user's email
    sendOtpEmail(user.Email, otp)
      .then(() => {
        // Store OTP in memory with an expiration timestamp (10 minutes validity)
        otpStore[user.Email] = { otp, timestamp: Date.now() };
        res.status(200).json({
          success: true,
          message: "OTP sent to email.",
          email: user.Email,
        });
      })
      .catch((error) => {
        console.error("Error sending OTP email:", error);
        res
          .status(500)
          .json({ success: false, message: "Failed to send OTP." });
      });
  });
});

// Check if user exists (Forgot Password route)
// Check if user exists (Forgot Password route)
app.post("/check-user", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res
      .status(400)
      .json({ success: false, message: "Username or email is required." });
  }

  // Query the database to check if the user exists by username or email
  const query = "SELECT * FROM user WHERE UserName = ? OR Email = ?";
  db.query(query, [username, username], (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // User exists, just return success message without OTP
    const user = results[0];
    res.status(200).json({
      success: true,
      message: "User exists. You can now reset your password.",
      email: user.Email, // Send email if necessary for future actions
    });
  });
});

// Reset Password Route (Verify OTP)
app.post("/reset-password", (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  // Check if OTP exists and is valid (with expiration check)
  const storedOtpData = otpStore[email];
  if (!storedOtpData) {
    return res.status(400).json({ success: false, message: "Invalid OTP." });
  }

  const { otp: storedOtp, timestamp } = storedOtpData;

  // Check if OTP is expired (10 minutes validity)
  const now = Date.now();
  const expirationTime = 10 * 60 * 1000; // 10 minutes in milliseconds
  if (now - timestamp > expirationTime) {
    delete otpStore[email]; // Remove expired OTP
    return res.status(400).json({ success: false, message: "OTP expired." });
  }

  if (otp !== storedOtp) {
    return res.status(400).json({ success: false, message: "Incorrect OTP." });
  }

  // Hash the new password and update it in the database
  bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Error encrypting password." });
    }

    const updateQuery = "UPDATE user SET Password = ? WHERE Email = ?";
    db.query(updateQuery, [hashedPassword, email], (err) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Error updating password." });
      }

      // Clear OTP after successful password reset
      delete otpStore[email];

      res
        .status(200)
        .json({ success: true, message: "Password reset successful." });
    });
  });
});

// Login Route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Username and password are required" });
  }

  const query = "SELECT * FROM user WHERE UserName = ? OR Email = ?";
  db.query(query, [username, username], (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    const user = results[0];

    // Compare passwords using bcrypt
    bcrypt.compare(password, user.Password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.status(500).json({
          success: false,
          message: "Error during password comparison",
        });
      }

      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Incorrect password" });
      }

      const token = jwt.sign(
        {
          id: user.UserID,
          username: user.UserName,
          email: user.Email,
        },
        "your_jwt_secret_key",
        {
          expiresIn: "1h",
        }
      );

      res.cookie("authToken", token, {
        httpOnly: true,
        maxAge: 3600000,
      });

      res.json({
        success: true,
        message: "Login successful",
        token,
      });
    });
  });
});

// Route to check if email exists in the database
app.post("/check-email", (req, res) => {
  const { email } = req.body;

  // Check if email is provided
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required." });
  }

  const query = "SELECT * FROM user WHERE Email = ?";
  db.query(query, [email], (error, results) => {
    if (error) {
      console.error("Error checking email existence:", error);
      return res.status(500).json({
        success: false,
        message: "Error checking email existence.",
      });
    }

    // If email exists, return true; otherwise, return false
    if (results.length > 0) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  });
});

// Route to check if username exists in the database
app.post("/check-username", (req, res) => {
  const { username } = req.body;

  // Check if username is provided
  if (!username) {
    return res
      .status(400)
      .json({ success: false, message: "Username is required." });
  }

  const query = "SELECT * FROM user WHERE UserName = ?";
  db.query(query, [username], (error, results) => {
    if (error) {
      console.error("Error checking username existence:", error);
      return res.status(500).json({
        success: false,
        message: "Error checking username existence.",
      });
    }

    // If username exists, return true; otherwise, return false
    if (results.length > 0) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  });
});

// Route to register user (this should be called after OTP verification)
// This route is used to store user data after OTP verification
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  // Hash the password before saving
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Error hashing password." });
    }

    // Insert user into the database
    const query =
      "INSERT INTO user (UserName, Email, Password) VALUES (?, ?, ?)";
    db.query(query, [username, email, hashedPassword], (error, results) => {
      if (error) {
        console.error("Error inserting user into database:", error);
        return res.status(500).json({
          success: false,
          message: "Error inserting user into database.",
        });
      }

      // Optionally, generate JWT token for the user
      const token = jwt.sign(
        { userId: results.insertId, username, email },
        "your_jwt_secret_key",
        { expiresIn: "1h" }
      );

      // Send token back in the response or as a cookie
      res.cookie("authToken", token, {
        // signed: true, // This makes it a signed cookie
        httpOnly: true,
        maxAge: 3600000,
        sameSite: "Strict",
      });
      return res.status(201).json({
        success: true,
        message: "User registered successfully.",
        token,
      });
    });
  });
});

// Start Server
app.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
});
