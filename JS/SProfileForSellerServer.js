const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
const mongoURI = "mongodb+srv://DVH:ishalu2627@clusterdvh.3sbj7.mongodb.net/"; 
const mongoClient = new MongoClient(mongoURI);
let mongoDB;

async function connectMongoDB() {
  try {
    await mongoClient.connect();
    mongoDB = mongoClient.db("DVH"); // Change to your DB name
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
}
connectMongoDB();

// MySQL Connection
const mysqlPool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", 
  database: "account", 
});

// 🔹 API to get userID and email using emailOrUsername
app.get("/api/getUser", async (req, res) => {
  const emailOrUsername  = req.query.emailOrUsername;
  console.log("Received emailOrUsername:", emailOrUsername);
  if (!emailOrUsername) {
    return res.status(400).json({ error: "emailOrUsername is required" });
}

  try {
      // Fetch userID and email from user table
      const [rows] = await mysqlPool.query(
          "SELECT UserID, Email FROM user WHERE UserName = ? OR Email = ?",
          [emailOrUsername.trim(), emailOrUsername.trim()]
      );
      console.log("Query returned:", rows);
      if (rows.length > 0) {
          res.json({ userID: rows[0].UserID, email: rows[0].Email });
      } else {
          res.status(404).json({ error: "User not found" });
      }
  } catch (error) {
      console.error("MySQL Error:", error);
      res.status(500).json({ error: "Database error" });
  }
});

// Function to verify password from MySQL
async function verifyPassword(emailOrUsername, password) {
  console.log("Received:", emailOrUsername, password); // Debugging line

  try {
    if (!emailOrUsername || !password) {
      throw new Error("Email and password are required");
  }

  const query = `SELECT Password FROM user WHERE UserName = ? OR Email = ? `;
  const [rows] = await mysqlPool.query(query, [emailOrUsername.trim(),emailOrUsername.trim()]);
    if (rows.length === 0) {
      throw new Error("User not found");
  }

    const storedPassword = rows[0].Password;
    if (!storedPassword || storedPassword.trim() === "") {
      throw new Error("Stored password is missing for this user");
  }
    const isMatch = await bcrypt.compare(password, storedPassword);
    
    return isMatch;
  } catch (error) {
    console.error("❌ MySQL Error:", error);
    return false;
  }
}

// API Route: Save Seller Data
app.post("/api/seller", async (req, res) => {
  console.log(req.body); 
  const {emailOrUsername, password, firstName, lastName, contactNumber, age, address, city, state, country, zipCode, agentData } = req.body;

  try {
    const isPasswordValid = await verifyPassword(emailOrUsername, password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Password not matched!" });
    }
  } catch (error) {
    console.error("❌ MySQL Error:", error);
    return res.status(401).json({ error: error.message });
  }


  try {
    // Retrieve UserID and email from localStorage (or you can pass them in the request)
    // For now, assume we have stored them from /api/getUser call.
    const userID = req.body.userID ; // If running in a Node environment, you'll pass them
    const email = req.body.email ;
    // Exclude the password from the seller data before saving
    console.log("Saving seller data for:", { userID,email,firstName, lastName, contactNumber, age, address, city, state, country, zipCode, agentData });
    const sellerData = {
      userID,
      email,
      firstName,
      lastName,
      contactNumber,
      age,
      address,
      city,
      state,
      country,
      zipCode,
      agentData,
    };

    // If password is valid, save the seller data in MongoDB
    const sellersCollection = mongoDB.collection("Seller");
    const result=await sellersCollection.updateOne(
      { userID }, 
      { $set: sellerData },
      { upsert: true }
    );
    console.log("MongoDB update result:", result);
    res.json({ message: "Seller details saved successfully" });
  } catch (error) {
    console.error("❌ MongoDB Error:", error);
    res.status(500).json({ error: "Failed to save seller details" });
  }
});


// Start Server
const PORT=5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
