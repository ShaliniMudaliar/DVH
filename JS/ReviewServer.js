const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const app = express();

// Middleware to parse JSON
app.use(express.json());
// Enable CORS for all routes
app.use(cors());
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
  } catch (err) {
    console.error("MongoDB connection error", err);
  }
}
initializeMongoDb();

// Endpoint to handle review submission for a property
app.post("/api/submitReview", async (req, res) => {
  const {
    propertyId,
    safety,
    connectivity,
    neighbourhood,
    livability,
    overall,
    text,
  } = req.body;

  // Get the username from localStorage (assuming it's sent from the frontend)
  const username = req.body.username; // You'll need to pass it from the frontend
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  // Validate the inputs (e.g., ratings should be between 1 and 5)
  if (
    ![safety, connectivity, neighbourhood, livability, overall].every(
      (rating) => rating >= 1 && rating <= 5
    )
  ) {
    return res.status(400).json({ error: "Ratings must be between 1 and 5" });
  }

  try {
    // Find the property in MongoDB by propertyId
    const property = await mongoDb
      .collection("Property")
      .findOne({ propertyId });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Create a new review object with the username and timestamp
    const newReview = {
      username,
      safety,
      connectivity,
      neighbourhood,
      livability,
      overall,
      text,
      timestamp: new Date(), // Get the current date and time
    };

    // Push the new review to the reviews array
    await mongoDb.collection("Property").updateOne(
      { propertyId },
      { $push: { reviews: newReview } } // Use $push to add the new review to the reviews array
    );

    // Return success response
    res.status(200).json({ success: "Review submitted successfully" });
  } catch (err) {
    console.error("Error submitting review:", err);
    res
      .status(500)
      .json({ error: "Error submitting review", message: err.message });
  }
});

// Endpoint to fetch reviews for a property
app.get("/api/reviews/:propertyId", async (req, res) => {
  const { propertyId } = req.params;

  try {
    const property = await mongoDb
      .collection("Property")
      .findOne({ propertyId });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    const reviews = property.reviews || []; // Return an empty array if no reviews
    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res
      .status(500)
      .json({ error: "Error fetching reviews", message: err.message });
  }
});
// Start the server
app.listen(3004, () => {
  console.log("Server running on port 3004");
});
