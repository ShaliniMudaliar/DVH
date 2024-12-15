import express from "express";
import mysql from "mysql";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://127.0.0.1:3000"], // Set your frontend's URL
    methods: ["GET", "POST"],
    credentials: true, // If you're using cookies for session
  })
);
app.use(cookieParser());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "account",
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    process.exit(1); // Exit the process if there's a database connection error
  }
  console.log("Connected to the MySQL database");
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
        signed: true, // This makes it a signed cookie
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

// Start the server
app.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
});
