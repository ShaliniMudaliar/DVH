const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// MongoDB Connection Setup
const mongoURI = "mongodb+srv://DVH:ishalu2627@clusterdvh.3sbj7.mongodb.net/";
const mongoClient = new MongoClient(mongoURI);
let mongoDB;

async function connectMongoDB() {
  try {
    await mongoClient.connect();
    mongoDB = mongoClient.db("DVH"); // Your database name
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
}
connectMongoDB();

// MySQL Connection Setup
const mysqlPool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "account",
});

// GET route to fetch seller details using localStorage values from client
// Client sends ?userId=...&email=...
app.get("/api/sellerDetails", async (req, res) => {
  const inputUserId = req.query.userId;
  const email = req.query.email;
  console.log("Received userId:", inputUserId, "and email:", email);

  try {
    // Step 1: Look up in MongoDB using the provided userID
    let sellerData = await mongoDB
      .collection("Seller")
      .findOne({ userID: inputUserId });
    if (sellerData) {
      return res.json(sellerData);
    }

    // Step 2: If not found, ensure email is provided to look up MySQL for the correct userID.
    if (!email) {
      return res.status(400).json({
        error:
          "Seller not found in MongoDB and no email provided for MySQL lookup.",
      });
    }

    // Query MySQL user table by email to get the correct UserID.
    const [rows] = await mysqlPool.query(
      "SELECT UserID, Email FROM user WHERE Email = ?",
      [email.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found in MySQL" });
    }

    const correctUserId = rows[0].UserID;
    console.log("UserID from MySQL using email:", correctUserId);

    // Step 3: Search MongoDB again using the correct UserID.
    sellerData = await mongoDB
      .collection("Seller")
      .findOne({ userID: correctUserId });
    if (sellerData) {
      return res.json(sellerData);
    } else {
      return res.status(404).json({
        error: "Seller details not found in MongoDB after MySQL lookup",
      });
    }
  } catch (error) {
    console.error("Error retrieving seller details:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// **🔹 API to Fetch Active Listings for a Seller**
app.get("/api/getActiveListings", async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: "UserID is required" });
  }

  try {
    // Convert userId to integer for MongoDB query if necessary
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      return res.status(400).json({ error: "Invalid userId format" });
    } 
    const propertyCollection = mongoDB.collection("Property");
    // Log userId for debugging

    const listings = await propertyCollection
      .find({ userId: userIdInt })
      .toArray();
    // Log results for debugging

    if (listings.length === 0) {
      return res.status(404).json({ message: "No active listings found" });
    }

    res.json({ listings });
  } catch (error) {
    console.error("❌ MongoDB Error:", error);
    res.status(500).json({ error: "Failed to retrieve listings" });
  }
});

// API to get property statistics by userId
app.get("/api/getPropertyStats", async (req, res) => {
  const userId = parseInt(req.query.userId);

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const totalListings = await mongoDB
      .collection("Property")
      .countDocuments({ userId });
    const propertiesSold = await mongoDB
      .collection("Property")
      .countDocuments({ userId, sellOrRent: "sell" });
    const propertiesRent = await mongoDB
      .collection("Property")
      .countDocuments({ userId, sellOrRent: "rent" });

    res.json({
      totalListings,
      propertiesSold,
      propertiesRent,
    });
  } catch (error) {
    console.error("❌ Error fetching property stats:", error);
    res.status(500).json({ error: "Failed to fetch property stats" });
  }
});

// Start Server
const PORT = 5002;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
