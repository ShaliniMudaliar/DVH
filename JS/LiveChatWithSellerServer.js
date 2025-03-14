require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");
const mysql = require("mysql2/promise");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// MySQL Connection
const mysqlPool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "account",
});


// MongoDB Connection
const mongoURI = "mongodb+srv://DVH:ishalu2627@clusterdvh.3sbj7.mongodb.net/";
const client = new MongoClient(mongoURI);

let db, messagesCollection;
async function connectDB() {
    await client.connect();
    db = client.db("DVH");
    messagesCollection = db.collection("LiveChat");
}
connectDB();

app.get("/getUsername/:emailOrUsername", async (req, res) => {
    const email = req.params.emailOrUsername;

    try {
        const conn = await mysqlPool.getConnection();
        const [rows] = await conn.execute(
            "SELECT UserName FROM user WHERE Email = ? OR UserName = ?", [email, email]
        );
        conn.release();

        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ UserName: rows[0].UserName });
    } catch (err) {
        console.error("Error fetching username:", err);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/getSeller/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        const conn = await mysqlPool.getConnection();
        const [rows] = await conn.execute("SELECT UserName FROM user WHERE USerId = ?", [userId]);
        conn.release();

        if (rows.length === 0) {
            return res.status(404).json({ error: "Seller not found" });
        }

        res.json({ UserName: rows[0].UserName });
    } catch (err) {
        console.error("Error fetching seller:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Fetch Recent Chats
app.get("/recent-chats/:username", async (req, res) => {
    const username = req.params.username;
    const chats = await messagesCollection.aggregate([
        {
            $match: { $or: [{ sender: username }, { receiver: username }] }
        },
        {
            $group: {
                _id: {
                    chatWith: {
                        $cond: [{ $eq: ["$sender", username] }, "$receiver", "$sender"]
                    }
                },
                lastMessage: { $last: "$message" },
                lastTimestamp: { $last: "$timestamp" }
            }
        },
        { $sort: { lastTimestamp: -1 } }
    ]).toArray();
    res.json(chats);
});

// Get Chat History
app.get("/messages/:sender/:receiver", async (req, res) => {
    const messages = await messagesCollection.find({
        $or: [
            { sender: req.params.sender, receiver: req.params.receiver },
            { sender: req.params.receiver, receiver: req.params.sender }
        ]
    }).sort({ timestamp: 1 }).toArray();
    res.json(messages);
});


// WebSocket Chat
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

// Send Message
    socket.on("sendMessage", async (data) => {
        const { sender, receiver, message } = data;

        if (!sender || !receiver || !message) return;

        const newMessage = { sender, receiver, message, timestamp: new Date() };
        await messagesCollection.insertOne(newMessage);

        io.emit(`receiveMessage-${receiver}`, newMessage); // Send to receiver
        io.emit(`receiveMessage-${sender}`, newMessage); // Show sender's own message
    });

// ✅ Mark Messages as Read
socket.on("markAsRead", async ({ sender, receiver }) => {
    try {
        await messagesCollection.updateMany(
            { sender, receiver, isRead: false },
            { $set: { isRead: true } }
        );
        console.log(`✅ Messages marked as read for ${receiver}`);
    } catch (error) {
        console.error("Error marking messages as read:", error);
    }
});

 // ✅ Delete Chat User
 socket.on("deleteChatUser", async ({ user, chatWith }) => {
    console.log(`Received request to delete chat between ${user} and ${chatWith}`);

    try {
        await messagesCollection.deleteMany({
            $or: [
                { sender: user, receiver: chatWith },
                { sender: chatWith, receiver: user }
            ]
        });
        io.emit("chatDeleted", chatWith);
        console.log(`❌ Chat deleted: ${user} with ${chatWith}`);
    } catch (error) {
        console.error("Error deleting chat:", error);
    }
});

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(5005, () => console.log("Live chat Server running on port 5005"));
