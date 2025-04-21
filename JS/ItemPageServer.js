const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const session = require("express-session");

const app = express();
app.use(express.json());
// app.use(cors());
app.use(
  cors({
    origin: "http://127.0.0.1:3007", // Your frontend origin
    credentials: true,
    methods: ["GET", "POST"], // Allow specific HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Explicitly allow headers // Allow sessions & cookies
  })
);

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

// API Route: Fetch seller details by userId
app.get("/sellers/:userId", async (req, res) => {
  try {
    const userID = req.params.userId;
    console.log("Fetching seller with userId:", userID);

    const seller = await mongoDB
      .collection("Seller")
      .findOne({ userID: userID });

    if (!seller) {
      console.log("Seller not found");
      return res.status(404).json({ error: "Seller not found" });
    }
    res.json(seller);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

// Session Middleware (Stores session data in memory)
app.use(
  session({
    secret: "ishalu2627", // Change this to a strong secret
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 30 }, // Session expires in 30 minutes
  })
);

// Global in-memory storage for property views (Resets when server restarts)
const propertyViews = {};

// Get views for a property
app.get("/views/:id", (req, res) => {
  const propertyId = req.params.id;
  res.json({ views: propertyViews[propertyId] || 0 });
});

// Increment views when a property is visited
app.post("/views/:id", (req, res) => {
  const propertyId = req.params.id;

  // Initialize property views if not set
  if (!propertyViews[propertyId]) {
    propertyViews[propertyId] = 0;
  }

  // Check if this user has already viewed this property in the session
  if (!req.session.viewedProperties) {
    req.session.viewedProperties = {};
  }

  if (!req.session.viewedProperties[propertyId]) {
    propertyViews[propertyId] += 1; // Increment global view count
    req.session.viewedProperties[propertyId] = true; // Mark as viewed in session
    console.log(
      `✅ View counted for ${propertyId}. Total: ${propertyViews[propertyId]}`
    );
  }

  res.json({ views: propertyViews[propertyId] });
});

// Start server
const PORT = 5003;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
