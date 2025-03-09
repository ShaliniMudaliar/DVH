const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// MongoDB connection URL
const mongoUrl = "mongodb+srv://DVH:ishalu2627@clusterdvh.3sbj7.mongodb.net/";
const dbName = "DVH"; // Replace with your DB name

// MongoDB Client
let client;

// Connect to MongoDB
async function connectDB() {
  try {
    client = new MongoClient(mongoUrl);
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// Ensure DB is connected before starting the server
connectDB();

// API endpoint to fetch questions
app.get("/api/getQuestions", async (req, res) => {
  try {
    const db = client.db(dbName);
    const chatBotCollection = db.collection("ChatBot"); // Your collection name is ChatBot

    // Fetch the document that contains the `q_and_a` array
    const chatBotData = await chatBotCollection.findOne({}); // Assuming you're fetching the first document

    if (!chatBotData || !chatBotData.q_and_a) {
      return res.status(404).json({ message: "No questions found" });
    }

    // Extracting the `q_and_a` array (questions and answers)
    const questions = chatBotData.q_and_a;

    // Send the questions as a response
    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Error fetching questions" });
  }
});

// Start the server
const PORT = 3005;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
