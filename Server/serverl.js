
import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import nodemailer from "nodemailer";
import cookieParser from 'cookie-parser';

const app=express();
app.use(express.json());
app.use(cors({
  origin: ['http://127.0.0.1:3000'],
  methods:['GET','POST'],
  credentials:true,
})
);
app.use(bodyParser.json());
app.use(cookieParser());

const db=mysql.createConnection({
host:"localhost",
user:"root",
password:"",
database:"account",
}
)

// Connect to MySQL
db.connect((err) => {
    if (err) {
      console.error("Database connection failed: ", err);
    } else {
      console.log("Connected to MySQL Database");
    }
  });

  // Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log("Request received:", username, password);

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  // Query to get the user data based on username or email
  const query = "SELECT * FROM user WHERE UserName = ? OR Email = ?";
  db.query(query, [username, username], (err, results) => {
    if (err) {
      console.error("Error querying the database: ", err);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }

    console.log("Query Results:", results);
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }

    const user = results[0];


// // Compare passwords
// bcrypt.compare(password, user.Password, (err, isMatch) => {
//   if (err) {
//     console.error("Error comparing passwords:", err);
//     return res.status(500).json({ success: false, message: "Error comparing passwords" });
//   }

//   if (!isMatch) {
//     return res.status(401).json({ success: false, errorType: "invalid_password", message: "Incorrect password" });
//   }

//   // Password matched, send success response with user data
//   return res.json({
//     success: true,
//     message: "Login successful",
//     user: { id: user.UserID, username: user.UserName, email: user.Email }
//   });
// });
// });
// });


// Directly compare the password entered by user with the one stored in database
if (user.Password === password) {
  // Password matches, return success response
  return res.json({
    success: true,
    message: "Login successful",
    user: { id: user.UserID, username: user.UserName, email: user.Email }
  });
} else {
  // Password doesn't match
  return res.status(401).json({
    success: false,
    errorType: "invalid_password",
    message: "Incorrect password"
  });
}
});
});

// // Store OTP temporarily (You can store this more securely in production, e.g., in the database)
// let otpStore = {};

// // Route to send OTP (this will be called on the frontend)
// app.post("/send-otp", (req, res) => {
//   const { email } = req.body;
//   if (!email) {
//     return res.status(400).json({ success: false, message: "Email is required." });
//   }

//   // Generate OTP (6-digit)
//   const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
//   console.log('Generated OTP:', otp); 

//   // Store OTP in memory with an expiry time (10 minutes)
//   otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

//   // Send OTP to user's email
//   sendOtpEmail(email, otp);

//   // Respond with success message
//   res.status(200).json({ success: true, message: 'OTP sent to email.' });
// });





// // Function to send OTP email
// const sendOtpEmail = (email, otp) => {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: "dreamviewhouserealestate@gmail.com", // Replace with your email
//       pass: "njmanyyvnohheyco", // Use app password if 2FA is enabled
//     },
//   });

//   const mailOptions = {
//     from: 'dreamviewhouserealestate@gmail.com',
//     to: email,
//     subject: 'Your OTP Code',
//     text: `Your OTP for password reset is: ${otp}`,
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.log('Error sending OTP email:', error);
//     } else {
//       console.log('OTP sent: ' + info.response);
//     }
//   });
// };






// Reset Password
app.post("/reset-password", (req, res) => {
  const { email, otp, newPassword } = req.body;
  const storedOtp = otpStore[email];


  if (!storedOtp) {
    return res.status(400).json({ success: false, message: "OTP not found." });
  }

  if (parseInt(otp) !== storedOtp.otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP." });
  }

  if (Date.now() > storedOtp.expiresAt) {
    return res.status(400).json({ success: false, message: "OTP has expired." });
  }

  // if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expiresAt) {
  //   return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
  // }

// Encrypt the new password
const saltRounds = 10;
bcrypt.hash(newPassword, saltRounds, (err, hashedPassword) => {
  if (err) {
    return res.status(500).json({ success: false, message: "Error encrypting password." });
  }

  // Update password in the database
  const query = "UPDATE user SET Password = ? WHERE Email = ?";
  db.query(query, [hashedPassword, email], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Database error." });
    }

    // Remove OTP from store after successful reset
    delete otpStore[email];
    res.status(200).json({ success: true, message: "Password updated successfully." });
  });
});
});

// app.listen(3000,()=>{
//     console.log("Connected...");
// });

app.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
});
