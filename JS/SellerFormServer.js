const express = require("express");
const mysql = require("mysql2/promise"); // Corrected import for mysql2 with promises
const { MongoClient } = require("mongodb");
const multer = require("multer");
const cors = require("cors");
const moment = require("moment-timezone");

const app = express();
// Enable CORS for all routes
app.use(cors());

// Set up a folder for storing images
const uploadFolder = "uploads/images";

// Configure multer to save files in the uploads/images directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(file.originalname.toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type, only JPEG, JPG, and PNG are allowed"));
    }
  },
});

// MySQL connection setup
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "account",
  // connectionLimit: 10,
}); // Ensuring promise-based connection pool

// MongoDB connection setup
const mongoClient = new MongoClient(
  "mongodb+srv://DVH:ishalu2627@clusterdvh.3sbj7.mongodb.net/"
);
let mongoDb;

// Initialize MongoDB connection
async function initializeMongoDb() {
  try {
    const client = await mongoClient.connect();
    mongoDb = client.db("DVH");
    console.log("Connected to MongoDB");
    // const currentTime = new Date();
    // const currentTime = moment().tz("Asia/Kolkata").format();
    // console.log(currentTime);
  } catch (err) {
    console.error("MongoDB connection error", err);
  }
}
initializeMongoDb();

// Endpoint to handle property form submission
app.post("/api/saveProperty", upload.array("photos", 7), async (req, res) => {
  console.log(req.body);
  console.log("Uploaded files:", req.files);
  const {
    email,
    heading,
    description,
    price,
    depositAmount,
    sellOrRent,
    address,
    city,
    state,
    zipcode,
    propertyType,
    furnishingType,
    bedrooms,
    bathrooms,
    yearBuilt,
    squareFeet,
    floor,
    facing,
    amenities,
  } = req.body;

  const photos = req.files || [];

  try {
    // Step 1: Fetch user ID from MySQL using email
    const [rows] = await db.query(
      "SELECT UserID FROM user WHERE UserName = ? OR Email = ?",
      [email, email]
    ); // Using .query() with promises

    if (rows.length > 0) {
      const userId = rows[0].UserID;

      // Step 2: Generate Property ID
      const propertyId = `PROP${Date.now()}`;
      const currentTime = moment()
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD, HH:mm:ss");
      // Step 3: Prepare property data
      const propertyData = {
        propertyId,
        userId,
        heading,
        description,
        sellOrRent,
        price,
        depositAmount: sellOrRent === "rent" ? depositAmount : null,
        address,
        city,
        state,
        zipcode,
        propertyType,
        furnishingType,
        bedrooms,
        bathrooms,
        yearBuilt,
        squareFeet,
        floor,
        facing,
        amenities: JSON.parse(amenities),
        createdAt: currentTime,
        photos: photos.map((photo) => `uploads/images/${photo.filename}`), // Ensure the relative path
      };
      console.log(photos);

      // Step 4: Store data in MongoDB
      await mongoDb.collection("Property").insertOne(propertyData);

      // Return the Property ID as part of the response
      res.status(200).json({
        success: "Property data saved successfully",
        propertyId: propertyData.propertyId,
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error("Error saving property:", err);
    res
      .status(500)
      .json({ error: "Error saving property", message: err.message });
  }
});

// Start the server
app.listen(3002, () => {
  console.log("Server running on http://localhost:3002");
});
