// const express = require("express");
// const razorpay = require("razorpay");
// const crypto = require("crypto"); // Import crypto
// const moment = require("moment");
// const cors = require("cors");
// const { MongoClient } = require("mongodb"); // MongoDB native driver
// const app = express();
// app.use(cors());
// // Razorpay configuration
// const instance = new razorpay({
//   key_id: "rzp_test_MPrakU71e0wiTi", // Use your actual Razorpay key ID
//   key_secret: "vD8V8135BbOoPt9iVQYryqib", // Use your actual Razorpay key secret
// });

// // Webhook secret (use the actual webhook secret from Razorpay)
// const webhookSecret =
//   "https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjYwNTY5MDYzNzA0MzM1MjZlNTUzMTUxMzMi_pc";

// // MongoDB Connection URL (replace with your actual MongoDB connection string)
// const mongoURI = "mongodb+srv://DVH:ishalu2627@clusterdvh.3sbj7.mongodb.net/";
// let mongoDb; // Global variable to hold the DB connection

// // Function to initialize MongoDB connection
// async function connectToDb() {
//   try {
//     const client = await MongoClient.connect(mongoURI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     mongoDb = client.db("DVH"); // Use the database named "DVH"
//     console.log("Connected to MongoDB");
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error);
//     process.exit(1); // Exit the process if MongoDB connection fails
//   }
// }

// // Initialize MongoDB connection
// connectToDb();

// // Use express built-in JSON parser
// app.use(express.json());

// // Endpoint to check how many properties the user has added
// app.get("/user-properties-count", async (req, res) => {
//   let userId = req.query.userId; // Get the userId from query parameters

//   console.log("Received userId:", userId); // Log the userId to check if it's passed correctly

//   // Ensure userId is an integer
//   userId = parseInt(userId, 10);

//   // Log the parsed userId
//   console.log("Parsed userId:", userId);

//   try {
//     // Fetch the count of properties added by the user
//     const propertyCount = await mongoDb
//       .collection("Property") // Assuming you have a "Property" collection
//       .countDocuments({ userId }); // Match the userId field in the database

//     console.log("Property count for userId:", userId, "is", propertyCount); // Log the property count

//     res.json({ propertyCount }); // Send the count as response
//   } catch (error) {
//     console.error("Error fetching user properties count:", error);
//     res.status(500).json({ error: "Failed to fetch user properties count" });
//   }
// });

// // Route to check subscription status
// app.get("/check-subscription", async (req, res) => {
//   const { userId } = req.query; // Get the user ID from query params

//   try {
//     const seller = await mongoDb
//       .collection("Seller") // Specify the collection
//       .findOne({ userID: userId }); // Match by userID

//     if (!seller) {
//       return res.status(404).json({ error: "Seller not found" });
//     }

//     // Check if the subscription is active
//     if (
//       seller.subscription_end_date &&
//       moment().isBefore(seller.subscription_end_date)
//     ) {
//       return res.json({ active: true });
//     } else {
//       return res.json({ active: false });
//     }
//   } catch (error) {
//     console.error("Error checking subscription:", error);
//     res.status(500).json({ error: "Failed to check subscription status" });
//   }
// });

// // Function to handle payment success
// app.post("/payment-success", async (req, res) => {
//   console.log("Received Webhook Body: ", req.body); // Log the request body

//   const { payment_id, order_id, userID } = req.body;

//   // Check if the userID is available
//   if (!userID) {
//     return res
//       .status(400)
//       .json({ error: "UserID is missing in the webhook payload" });
//   }

//   const signature = req.headers["x-razorpay-signature"];

//   // Generate the signature using Razorpay's webhook secret
//   const generatedSignature = crypto
//     .createHmac("sha256", webhookSecret)
//     .update(order_id + "|" + payment_id)
//     .digest("hex");

//   // Verify the signature to ensure the request is valid
//   if (generatedSignature === signature) {
//     console.log("Payment successful, payment ID: ", payment_id);

//     // Proceed with updating subscription details in the Seller collection
//     try {
//       const updatedSeller = await mongoDb.collection("Seller").findOneAndUpdate(
//         { userID: userID }, // Ensure the correct field is being matched
//         {
//           $set: {
//             subscription_status: "active",
//             subscription_start_date: new Date(),
//             subscription_end_date: new Date(
//               new Date().setMonth(new Date().getMonth() + 1)
//             ), // Add 1 month to the subscription end date
//           },
//         },
//         { returnDocument: "after" }
//       );

//       if (!updatedSeller.value) {
//         return res.status(404).json({ error: "Seller not found" });
//       }

//       res.status(200).json({
//         success: true,
//         message: "Payment verified and subscription updated",
//       });
//     } catch (error) {
//       console.error("Error processing payment:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   } else {
//     res.status(400).json({ error: "Invalid signature" });
//   }
// });

// // Start the server
// app.listen(3006, () => {
//   console.log("Server running on port 3006");
// });

const express = require("express");
const razorpay = require("razorpay");
// const crypto = require("crypto");
const moment = require("moment");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const app = express();

app.use(cors());

// Razorpay configuration
// const instance = new razorpay({
//   key_id: "rzp_test_MPrakU71e0wiTi", // Replace with your Razorpay key ID
//   key_secret: "vD8V8135BbOoPt9iVQYryqib", // Replace with your Razorpay key secret
// });

// MongoDB Connection URL
const mongoURI = "mongodb+srv://DVH:ishalu2627@clusterdvh.3sbj7.mongodb.net/";
let mongoDb; // Global variable to hold the DB connection

// Function to initialize MongoDB connection
async function connectToDb() {
  try {
    const client = await MongoClient.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    mongoDb = client.db("DVH"); // Use the database named "DVH"
    console.log("Connected to MongoDB payment");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process if MongoDB connection fails
  }
}

// Initialize MongoDB connection
connectToDb();

// Use express built-in JSON parser
app.use(express.json());
// Initialize Razorpay instance
const instance = new razorpay({
  key_id: "rzp_test_MPrakU71e0wiTi", // Replace with your Razorpay key ID
  key_secret: "vD8V8135BbOoPt9iVQYryqib", // Replace with your Razorpay key secret
});

// Endpoint to process payment and create Razorpay order
app.post("/process-payment", async (req, res) => {
  console.log("Inside the process-payment");
  const { userId, plan } = req.body;

  // Ensure that userId and plan are passed
  if (!userId || !plan) {
    return res.status(400).json({ error: "userId and plan are required" });
  }

  // Calculate the amount based on the plan selected
  let amount;
  if (plan === "1 month") {
    amount = 99 * 100; // 99 INR * 100 (as Razorpay works in paise)
  } else if (plan === "6 month") {
    amount = 499 * 100; // 499 INR * 100
  } else if (plan === "12 month") {
    amount = 899 * 100; // 899 INR * 100
  } else {
    return res.status(400).json({ error: "Invalid plan" });
  }

  try {
    // Create a Razorpay order
    const order = await instance.orders.create({
      amount: amount, // The amount to be charged
      currency: "INR", // Currency in INR
      receipt: `receipt_${Date.now()}`, // Unique receipt ID
      payment_capture: 1, // Auto-capture payment
    });

    // Send the Razorpay order details back to the frontend
    res.status(200).json({
      key: instance.key_id, // Razorpay Key ID
      orderId: order.id, // Razorpay Order ID
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to check how many properties the user has added
app.get("/user-properties-count", async (req, res) => {
  console.log("Inside the count");
  let userId = req.query.userId; // Get the userId from query parameters

  userId = parseInt(userId, 10); // Ensure userId is an integer
  console.log(userId);
  try {
    const propertyCount = await mongoDb
      .collection("Property") // Assuming you have a "Property" collection
      .countDocuments({ userId }); // Match the userId field in the database
    console.log(propertyCount);
    res.json({ propertyCount }); // Send the count as response
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user properties count" });
  }
});

// Route to check subscription status
// app.get("/check-subscription", async (req, res) => {
//   console.log("Inside the check-sub");
//   const { userId } = req.query; // Get the user ID from query params

//   try {
//     const seller = await mongoDb
//       .collection("Seller") // Specify the collection
//       .findOne({ userID: userId }); // Match by userID

//     if (!seller) {
//       return res.status(404).json({ error: "Seller not found" });
//     }

//     // Check if the subscription is active
//     if (
//       seller.subscription_end_date &&
//       moment().isBefore(seller.subscription_end_date)
//     ) {
//       return res.json({ active: true });
//     } else {
//       return res.json({ active: false });
//     }
//   } catch (error) {
//     res.status(500).json({ error: "Failed to check subscription status" });
//   }
// });

// const moment = require("moment"); // Assuming moment is used for date manipulation

app.get("/check-subscription", async (req, res) => {
  console.log("Inside the check-subscription");

  const { userId } = req.query; // Get the user ID from query params
  console.log(userId);
  try {
    // Fetch seller details to get subscription dates
    const seller = await mongoDb
      .collection("Seller") // Specify the collection
      .findOne({ userID: String(userId) }); // Match by userID
    console.log(seller);
    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    // Fetch the subscription dates for the seller
    const { subscription_start_date, subscription_end_date } = seller;

    if (!subscription_start_date || !subscription_end_date) {
      return res.status(400).json({ error: "Subscription dates are missing" });
    }

    // Assuming subscription_start_date and subscription_end_date are provided
    const start = moment(subscription_start_date);
    const end = moment(subscription_end_date);

    // Calculate the duration in months
    const subscriptionDuration = end.diff(start, "months");

    // Check if the subscription duration is exactly 1 month, accounting for days in the month
    const isLessThanOneMonth = end.isSameOrBefore(
      start.clone().add(1, "months").endOf("month"),
      "day"
    );

    let finalSubscriptionDuration = subscriptionDuration;
    if (isLessThanOneMonth) {
      finalSubscriptionDuration = 1; // Treat as a 1-month subscription if less than 1 month
    }

    // Now, you have the final subscription duration (1, 6, or 12 months)
    console.log(
      "Final Subscription Duration in Months:",
      finalSubscriptionDuration
    );

    // Handle the remaining logic based on subscription duration
    let subscription_limit;
    if (finalSubscriptionDuration === 1) {
      subscription_limit = 4; // 1 month subscription allows 4 properties
    } else if (finalSubscriptionDuration === 6) {
      subscription_limit = 30; // 6 month subscription allows 30 properties
    } else if (finalSubscriptionDuration === 12) {
      subscription_limit = Infinity; // 12 month subscription allows unlimited properties
    } else {
      subscription_limit = 0; // Invalid duration
    }

    // You can now proceed to compare properties or handle your logic accordingly
    console.log("Subscription Limit:", subscription_limit);

    // Convert subscription dates to JavaScript Date objects
    const subscriptionStartDate = new Date(subscription_start_date);
    const subscriptionEndDate = new Date(subscription_end_date);
    // Check if the subscription is active
    const isSubscriptionActive = moment().isBefore(
      moment(subscription_end_date)
    );
    console.log(isSubscriptionActive);
    // Query the Property collection to count properties within the subscription date range
    // Query the Property collection to count properties created within the subscription date range
    const properties = await mongoDb
      .collection("Property")
      .find({ userId: parseInt(userId, 10) })
      .toArray(); // Fetch all properties for this user

    let propertyCount = 0;

    // Iterate over properties and compare their createdAt with subscription dates
    properties.forEach((property) => {
      // Parse the createdAt string into a JavaScript Date object
      const createdAt = moment(
        property.createdAt,
        "YYYY-MM-DD, HH:mm:ss"
      ).toDate();

      // Compare if the createdAt is within the subscription date range
      if (
        createdAt >= subscriptionStartDate &&
        createdAt <= subscriptionEndDate
      ) {
        propertyCount++;
      }
    });
    console.log(moment(subscription_start_date).format("YYYY-MM-DD, HH:mm:ss"));
    console.log(propertyCount);
    // Calculate remaining properties within the subscription limit
    const remainingLimit =
      subscription_limit === Infinity
        ? "Unlimited"
        : subscription_limit - propertyCount;
    console.log(remainingLimit);
    // Return the response with the subscription status, property count, and remaining limit
    return res.json({
      active: isSubscriptionActive,
      propertyCount: propertyCount,
      remainingLimit: remainingLimit,
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    res.status(500).json({ error: "Failed to check subscription status" });
  }
});

app.post("/payment-success", async (req, res) => {
  console.log("Received payment success:", req.body); // Log the received data

  const { userID, plan } = req.body;
  if (!userID) {
    return res
      .status(400)
      .json({ error: "UserID is missing in the request body" });
  }

  // Ensure userID is treated as a string when searching in the database
  const seller = await mongoDb
    .collection("Seller")
    .findOne({ userID: String(userID) });
  console.log("Received userID:", seller); // Log the received seller document

  if (!seller) {
    return res.status(404).json({ error: "Seller not found" });
  }

  const currentDate = new Date();

  // Determine subscription duration and set subscription end date
  let subscriptionDurationInMonths;
  let subscriptionEndDate;

  switch (plan) {
    case "1 month":
      subscriptionDurationInMonths = 1;
      break;
    case "6 month":
      subscriptionDurationInMonths = 6;
      break;
    case "12 month":
      subscriptionDurationInMonths = 12;
      break;
    default:
      return res.status(400).json({ error: "Invalid plan" });
  }

  subscriptionEndDate = new Date(currentDate);
  subscriptionEndDate.setMonth(
    subscriptionEndDate.getMonth() + subscriptionDurationInMonths
  );

  // Update subscription status and dates in the database
  const updateResult = await mongoDb.collection("Seller").updateOne(
    { userID: String(userID) }, // Ensure userID is treated as a string here as well
    {
      $set: {
        subscription_status: "active",
        subscription_start_date: new Date(),
        subscription_end_date: subscriptionEndDate,
      },
    }
  );

  if (updateResult.modifiedCount === 0) {
    return res.status(500).json({ error: "Failed to update the subscription" });
  }

  return res
    .status(200)
    .json({ success: true, message: "Subscription updated" });
});

// Start the server
app.listen(3006, () => {
  console.log("Server running on port 3006");
});
