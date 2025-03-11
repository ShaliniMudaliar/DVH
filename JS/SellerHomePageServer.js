const express = require("express");
const { MongoClient } = require("mongodb");
const mysql = require("mysql2");
const cors = require("cors"); // CORS middleware
const path = require("path");
const multer = require("multer");

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

// Initialize multer with configurations
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

// Serve images from the 'uploads' directory
const app = express();
app.use(express.json()); // Add this middleware to parse incoming JSON bodies

// Enable CORS for all routes
app.use(cors());

// MongoDB Connection
const mongoUrl = "mongodb+srv://DVH:ishalu2627@clusterdvh.3sbj7.mongodb.net/";
const dbName = "DVH"; // Replace with your DB name

// MySQL Connection
const mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "account",
});

// Middleware to serve static files like images, etc.
app.use(express.static("public"));

// Function to get userId by email/username from MySQL
function getUserIdFromEmailOrUsername(emailOrUsername, callback) {
  console.log("Connected to sql");
  mysqlConnection.query(
    "SELECT UserID FROM user WHERE Email = ? OR UserName = ?",
    [emailOrUsername, emailOrUsername],
    (error, results) => {
      if (error) {
        callback(error, null);
        return;
      }
      if (results.length === 0) {
        callback("No user found", null);
        return;
      }
      callback(null, results[0].UserID); // Returning userId
    }
  );
}

// Function to get property details from MongoDB by userId
async function getPropertyDetails(userId, callback) {
  const client = new MongoClient(mongoUrl);
  console.log("Connected to MongoDB");
  try {
    await client.connect();
    const db = client.db(dbName);
    const propertiesCollection = db.collection("Property");

    // Query MongoDB for all properties for the given userId
    const properties = await propertiesCollection.find({ userId }).toArray();

    if (properties.length === 0) {
      callback("No properties found for this userId", null);
      return;
    }

    // Map through properties and format the required data
    const propertyData = properties.map((property) => ({
      firstImage: property.photos ? property.photos[0] : "",
      propertyId: property.propertyId,
      heading: property.heading,
      address: property.address,
      price: property.price,
      city: property.city,
      state: property.state,
      createdAtAgo: getTimeAgo(property.createdAt),
    }));

    callback(null, propertyData);
  } catch (err) {
    callback(err, null);
  } finally {
    await client.close();
  }
}

// Helper function to calculate the time difference in "X days ago" format
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInSeconds / (60 * 60));
  const diffInDays = Math.floor(diffInSeconds / (60 * 60 * 24));
  const diffInMonths = Math.floor(diffInDays / 30); // Approximate number of days in a month
  const diffInYears = Math.floor(diffInDays / 365); // Approximate number of days in a year

  if (diffInSeconds < 60) return "Just now"; // less than a minute
  if (diffInMinutes === 1) return "1 minute ago";
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

  if (diffInHours === 1) return "1 hour ago";
  if (diffInHours < 24) return `${diffInHours} hours ago`;

  if (diffInDays === 1) return "1 day ago";
  if (diffInDays < 30) return `${diffInDays} days ago`;

  if (diffInMonths === 1) return "1 month ago";
  if (diffInMonths < 12) return `${diffInMonths} months ago`;

  if (diffInYears === 1) return "1 year ago";
  return `${diffInYears} years ago`;
}

// Example route to serve property data for a given email/username
app.get("/getPropertyDetails", (req, res) => {
  console.log("Connected to sql1");
  const emailOrUsername = req.query.emailOrUsername;

  // Step 1: Get userId by email/username from MySQL
  getUserIdFromEmailOrUsername(emailOrUsername, (error, userId) => {
    if (error) {
      return res.status(500).json({ message: error });
    }

    // Step 2: Fetch property details by userId from MongoDB
    getPropertyDetails(userId, (error, propertyData) => {
      if (error) {
        return res.status(404).json({ message: error });
      }

      // Step 3: Return the property data
      res.json(propertyData);
    });
  });
});

// Route to get property details by propertyId
app.get("/getPropertyDetailsById", async (req, res) => {
  const { propertyId } = req.query;

  if (!propertyId) {
    return res.status(400).json({ message: "Property ID is required" });
  }

  const client = new MongoClient(mongoUrl);
  try {
    await client.connect();
    const db = client.db(dbName);
    const propertiesCollection = db.collection("Property");

    // Fetch property details from MongoDB by propertyId
    const property = await propertiesCollection.findOne({ propertyId });
    // console.log(property);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Map through the property and return the data
    const propertyData = {
      propertyId: property.propertyId,
      heading: property.heading,
      description: property.description,
      price: property.price,
      depositAmount: property.depositAmount,
      sellOrRent: property.sellOrRent,
      address: property.address,
      city: property.city,
      state: property.state,
      zipcode: property.zipcode,
      propertyType: property.propertyType,
      furnishingType: property.furnishingType,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      yearBuilt: property.yearBuilt,
      squareFeet: property.squareFeet,
      floor: property.floor,
      facing: property.facing,
      amenities: property.amenities || [], // Optional: handle amenities if required
      photos: property.photos || [], // Include all photos here
      createdAtAgo: getTimeAgo(property.createdAt),
    };

    // Return the property data
    res.json(propertyData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    await client.close();
  }
});

// Route to update property
app.put(
  "/updateProperty/:propertyId",
  upload.array("photos[]", 7),
  async (req, res) => {
    const propertyId = req.params.propertyId;
    const {
      heading,
      description,
      price,
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
      sellOrRent,
      amenities,
      depositAmount,
    } = req.body;
    // Assuming `photos` is an array of uploaded files
    const photos = req.files;

    // Map over the uploaded files and generate the paths
    const photoPaths = photos
      ? photos.map((photo) => `${uploadFolder}/${photo.filename}`)
      : [];

    const client = new MongoClient(mongoUrl);
    try {
      await client.connect();
      const db = client.db(dbName);
      const propertiesCollection = db.collection("Property");

      const property = await propertiesCollection.findOne({ propertyId });
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      const updatedProperty = {
        heading,
        description,
        price,
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
        sellOrRent,
        amenities: JSON.parse(amenities),
        depositAmount: sellOrRent === "rent" ? depositAmount : undefined,
      };
      // If new photos are uploaded, replace the old ones
      if (photoPaths && photoPaths.length > 0) {
        updatedProperty.photos = photoPaths; // Use photoPaths instead of newPhotos
      } else {
        updatedProperty.photos = property.photos; // Keep the existing photos if no new ones are uploaded
      }

      const result = await propertiesCollection.updateOne(
        { propertyId },
        { $set: updatedProperty }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Property not found" });
      }

      res.json({ message: "Property updated successfully" }); // Always send JSON
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", error: err.message }); // Send JSON in case of error
    }
  }
);

// Start the server
const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
