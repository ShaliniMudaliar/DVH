const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

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

// API Route: Fetch seller details by userId
app.get("/sellers/:userId", async (req, res) => {
    try {
      const userID = req.params.userId;
      console.log("Fetching seller with userId:", userID);
      
    const seller = await mongoDB.collection("Seller").findOne({ userID: userID });
    
      if (!seller) {
        console.log("Seller not found");
        return res.status(404).json({ error: "Seller not found" });
      }
      res.json(seller);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error",details: error.message });
    }
  });
  
  // Start server
  const PORT =5003;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));