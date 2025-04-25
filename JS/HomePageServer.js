const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors"); // CORS middleware
const path = require("path");
const mysql = require("mysql2");
const app = express();

// Serve images from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "account",
  port: 3306,
});

// Route to fetch userId based on username or email
app.post("/getUserId", async (req, res) => {
  const { username } = req.body; // Get the username from the request body

  try {
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }
    console.log("sql");
    // Query to get the userId where either UserName or Email matches the same value
    const query = "SELECT UserID FROM user WHERE UserName = ? OR Email = ?";

    // The correct way to handle the result from db.execute
    pool.execute(query, [username, username], (err, rows) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ error: "Database query error" });
      }

      if (rows.length > 0) {
        res.json({ userId: rows[0].UserID }); // Assuming the first row has the UserID
      } else {
        res.status(404).json({ error: "User not found" });
      }
    });
  } catch (error) {
    console.error("Error fetching userId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// MongoDB Connection
const mongoUrl = "mongodb+srv://DVH:ishalu2627@clusterdvh.3sbj7.mongodb.net/";
const dbName = "DVH"; // Replace with your DB name

// Middleware to serve static files like images, etc.
app.use(express.static("public"));

// Function to get all property details from MongoDB
async function getAllProperties(callback) {
  const client = new MongoClient(mongoUrl);
  console.log("Connected to MongoDB");
  try {
    await client.connect();
    const db = client.db(dbName);
    const propertiesCollection = db.collection("Property");

    // Query MongoDB for all properties
    const properties = await propertiesCollection.find({}).toArray();

    if (properties.length === 0) {
      callback("No properties found", null);
      return;
    }

    // Map through properties and format the required data
    const propertyData = properties.map((property) => ({
      firstImage: property.photos ? property.photos[0] : "",
      photos: property.photos,
      propertyId: property.propertyId,
      heading: property.heading,
      address: property.address,
      price: property.price,
      city: property.city,
      state: property.state,
      userId: property.userId,
      description: property.description,
      depositAmount: property.depositAmount,
      sellOrRent: property.sellOrRent,
      zipcode: property.zipcode,
      propertyType: property.propertyType,
      furnishingType: property.furnishingType,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      yearBuilt: property.yearBuilt,
      squareFeet: property.squareFeet,
      floor: property.floor,
      facing: property.facing,
      amenities: property.amenities,
      createdAtAgo: getTimeAgo(property.createdAt),
      views: property.views || 0, // Ensure views exist
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

// Add the new endpoint to increment view count
app.post("/api/incrementViewCount", async (req, res) => {
  const { propertyId } = req.body;

  if (!propertyId) {
    return res.status(400).json({ error: "Property ID is required" });
  }

  const client = new MongoClient(mongoUrl);

  try {
    await client.connect();
    const db = client.db(dbName);
    const propertiesCollection = db.collection("Property");

    // Find the property in MongoDB by propertyId
    const property = await propertiesCollection.findOne({ propertyId });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Increment the view count using $inc operator
    await propertiesCollection.updateOne(
      { propertyId },
      { $inc: { views: 1 } } // Increment the views field
    );

    // Fetch the updated property with the incremented view count
    const updatedProperty = await propertiesCollection.findOne({ propertyId });

    // Return the updated view count
    res.status(200).json({ updatedViewCount: updatedProperty.views });
  } catch (err) {
    console.error("Error incrementing view count:", err);
    res
      .status(500)
      .json({ error: "Error incrementing view count", message: err.message });
  } finally {
    await client.close();
  }
});

// Route to fetch all properties
app.get("/getAllProperties", (req, res) => {
  getAllProperties((error, propertyData) => {
    if (error) {
      return res.status(404).json({ message: error });
    }
    res.setHeader("Content-Type", "application/json"); // Ensure the response is JSON
    res.json(propertyData); // Send JSON data
  });
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
