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
});

// Route to fetch userId based on username or email
app.post("/getUserId", async (req, res) => {
  const { username } = req.body; // Get the username from the request body

  try {
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

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

// // Endpoint to fetch userId based on username or email
// app.get("/api/getUserId", async (req, res) => {
//   const { username } = req.query; // Username is being passed here

//   if (!username) {
//     return res.status(400).json({ error: "Username is required" });
//   }

//   try {
//     // Query to fetch the UserID based on either UserName or Email
//     const [rows] = await pool.query(
//       "SELECT UserID FROM user WHERE UserName = ? OR Email = ?",
//       [username, username]
//     );

//     if (rows.length > 0) {
//       const userId = rows[0].UserID;
//       return res.json({ userId });
//     } else {
//       return res.status(404).json({ error: "User not found" });
//     }
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ error: "An error occurred while fetching userId" });
//   }
// });

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
  const diffInDays = Math.floor(diffInSeconds / (60 * 60 * 24));

  if (diffInDays <= 0) return "Today";
  if (diffInDays === 1) return "1 day ago";
  return `${diffInDays} days ago`;
}

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
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
