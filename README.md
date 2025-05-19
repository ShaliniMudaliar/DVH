❖ BACKGROUND 
The traditional process of buying, selling, and renting properties has long been burdened by 
limitations.  Physical tours can be time-consuming and inconvenient, static photos and videos 
offer a limited perspective, and information about properties and neighbourhoods can be 
scattered and fragmented.  
As technology evolves and people's lives become increasingly digital, the demand for a more 
efficient and interactive way to navigate the real estate market has grown significantly. 
Recognizing this gap, DreamView House was conceived to leverage virtual technology and 
enhance the user experience in the real estate market. 
The current online real estate platforms often fall short in providing a fully interactive and 
detailed property exploration experience. Users face challenges in visualizing properties, 
understanding the nuances of the neighbourhoods, and making informed decisions without 
physically visiting the sites. There is a need for a solution that offers detailed virtual tours, real
time communication, and comprehensive property information to facilitate better decision
making in property transactions. 
DreamView House addresses these challenges by providing a platform that allows users to 
explore properties as if they were physically present. This is particularly significant in today’s 
fast-paced world where convenience and efficiency are paramount. By offering immersive 
panoramic views, high-quality photos, videos, and virtual tours, DreamView House helps users 
make informed decisions without the need for extensive travel. This platform is especially 
relevant in the current climate, where remote access to services has become increasingly 
important. 


❖ OBJECTIVES 
The primary objective of DreamView House is to redefine the online real estate experience by 
making property exploration more interactive, detailed, and user-friendly. The goals include: 
➢ Provide immersive virtual images and enhanced search filters to help users find 
properties easily.  
➢ Facilitate real-time communication between buyers and sellers. 
➢ Offer detailed property and neighborhood insights with intuitive navigation tools. 
➢ Implement a subscription model for sellers, allowing the first property listing for free, 
with subsequent listings requiring a paid membership. 
➢ Include a chatbot for instant user assistance and use reviews to support informed 
decision-making. 


❖ PURPOSE, SCOPE AND APPLICABILITY 

❖ PURPOSE 
The "Virtually DreamView House" website is designed to revolutionize the real estate market 
by transforming the buying, selling, and renting experience through advanced technology. Its 
primary objective is to provide users with a seamless, immersive, and interactive platform to 
explore properties. Leveraging panoramic virtual images, and other interactive features, the 
website aims to enhance user engagement and streamline decision-making in real estate 
transactions. This innovative approach seeks to make property exploration more convenient, 
detailed, and user-friendly, ultimately empowering users to make informed decisions. 

❖ SCOPE 

The scope of the "Virtually DreamView House" website encompasses the following key 
functionalities: 
➢ Immersive Property Exploration: Panoramic virtual images and videos for all property 
listings. High-resolution images and detailed property descriptions. 
➢ Enhanced Search and Filter Capabilities: Advanced search functionalities to find properties 
based on criteria like budget, location, size, and amenities. Comprehensive filter options to 
narrow down property choices 
➢ Interactive User Engagement: Real-time communication tools for seamless interaction 
between buyers and sellers. An intuitive chatbot for instant support and query resolution. 
➢ Comprehensive Property Information: Extensive property listings with pricing, location, 
and amenity details. User reviews and ratings to provide valuable insights. Information on 
local amenities, schools, transportation, and neighbourhood features. 
➢ Property Management Tools for Sellers and Landlords: Tools to facilitate property listing 
management, including photo uploads, description writing, and pricing settings. 
➢ Navigation and Directional Tools: Features to help users efficiently find properties and 
explore neighbourhoods. 
➢ Subscription-Based Model for Sellers: (First Listing Free, Subsequent Listings Paid) 
Implement a subscription-based model for sellers, where the first property listing is free, 
but subsequent listings require a paid membership. This ensures a sustainable platform 
while allowing sellers to promote their properties effectively. 


❖ APPLICABILITY 

• Homebuyers and Renters: Explore and evaluate potential homes remotely, saving time on 
physical visits. 
• Sellers and Landlords: List properties with detailed information and virtual tours to attract 
buyers or renters. 
• Real Estate Agents and Brokers: Showcase properties, communicate with clients in real
time, and provide comprehensive property information. 
• Remote and International User: Explore properties remotely using virtual and augmented 
reality features.    


❖ ACHIEVEMENTS 

Through the successful completion of this project, comprehensive knowledge was gained in 
full-stack web development, covering both frontend and backend integration. Core concepts 
such as real-time communication using Socket.IO, secure payment processing with Razorpay, 
and immersive experiences using 360-degree image rendering with A-Frame were effectively 
applied. The project also strengthened understanding of efficient database operations, user 
input validation, session management, and UI responsiveness, contributing to overall skill 
enhancement in building scalable and interactive web applications. 
The project contributes to the domain of virtual property exploration by enabling a platform 
where users can interactively view properties, engage in real-time chat, and manage 
subscriptions seamlessly. The main objectives—such as user registration with OTP 
verification, real-time messaging, subscription handling, and 360-degree viewing—were 
successfully achieved. In some areas, the goals were exceeded by implementing performance 
optimizations, efficient state handling, and enhancing user experience through dynamic UI 
updates and data management techniques.

❖ Technologies Used  
▪ HTML 
▪ CSS3 
▪ JavaScript 
▪ A-Frame 
▪ Node.js 
▪ Express.js
▪ Razorpay
▪ MySQL 
▪ NoSQL(MONGODB) 

❖ Code Efficiency  

➢ Signup Module: 
This module allows users to create new accounts by providing their details such as name, email, 
and password. Upon submission, the backend validates the input data (e.g., checking if the 
email is already in use, ensuring required fields are filled correctly). After validation, an OTP 
verification step is triggered to confirm the authenticity of the provided contact details. The 
user must successfully verify the OTP before their information is stored in the database. 

Efficiency:
Proper validation ensures data integrity, and checks for duplicates minimize 
unnecessary database writes. OTP verification acts as a second layer of security, ensuring the 
provided contact details are authentic before storing them. 
 
Workflow: 
User submits registration details → Backend validates the inputs → If valid, OTP is sent to the 
user for verification → User enters OTP → If OTP is valid, user data is saved to the database 
→ User completes registration and is granted access. 

➢ OTP Module: 

This module is responsible for verifying the user's contact details during the signup process. 
After the user submits their registration details, an OTP (One-Time Password) is generated and 
sent to the user's email. The user must enter the OTP they received to proceed with completing 
their registration. This step ensures that the provided contact details are valid and belong to the 
user. 

Efficiency:
The OTP system ensures the contact details are verified without storing data 
prematurely. It adds an extra layer of security and minimizes the chances of fraudulent signups. 

Workflow: 
User submits registration details → OTP is generated and sent to the user's email → User enters 
the OTP → Backend verifies the OTP → If valid, user data is stored, and registration is 
complete. 

➢ 360-Degree Image View Module: 

This module allows users to view product images in a 360-degree interactive view. When the 
user clicks on a product image, the system activates the 360-degree view mode, displaying the 
product from all angles. The view is designed to toggle between the 360-degree view and the 
standard product image, offering a seamless transition and improved user interaction. 

Efficiency:
Asynchronous handling prevents UI blockages, and class manipulations (e.g., 
classList.add/remove) ensure smooth DOM updates. Using a global click handler reduces 
overhead, and VR mode enhances user engagement while keeping performance optimized. 

Workflow: 
User clicks product image → handleImageClick() is triggered → First click activates 360
degree view → In 3600 , it sets image in a-sky and displays the 360-degree container → 360
degree container is shown, and the main product view is hidden →Dropdown menu is hidden 
→ Subsequent clicks return to the standard product view → Global click handler closes 
dropdowns and modals if clicked outside. 

 
➢ Subscription Payment Module 

This module manages subscription payments for sellers using Razorpay. Sellers can choose 
from 1, 6, or 12-month plans. The selected plan dynamically sets the amount and creates a 
Razorpay order. Transactions are handled securely in Razorpay’s modal. Once payment 
succeeds, the system stores subscription details (amount, plan, expiry) and controls property 
posting rights accordingly. 

Efficiency: 
Asynchronous Razorpay integration, accurate subscription expiry using 
moment.js, minimal DB writes, and real-time subscription checks.

Workflow: 
User selects plan → /process-payment creates Razorpay order → Payment completed via 
Razorpay modal → /payment-success saves subscription → User access updated → /check
subscription verifies access status and can add more properties 


➢ Live Chat Module 

This module enables real-time messaging between buyers and sellers using Socket.IO. The 
buyer’s username is stored locally after login to manage chat context. Recent conversations are 
loaded via MongoDB aggregation. Full chat history is retrieved when a contact is selected. 
Messages are sent instantly with socket.emit() and received via socket.on(). Read receipts are 
triggered when a conversation is opened. Users can delete individual messages or entire 
conversations, which reflect instantly in the UI and database. 

Efficiency:
Real-time communication using Socket.IO, optimized MongoDB aggregation for 
recent chats, selective UI updates to prevent rerenders, local/session storage to avoid repeated 
API calls. 

Workflow: 
User logs in → getUsernameFromEmail() stores username → loadChatUsers() fetches recent 
chats → User selects contact → loadMessages() fetches full history → sendMessage() emits 
and displays new message → socket.on() handles incoming messages → 
socket.emit("markAsRead") marks as read → deleteMessage() removes message → 
deleteChatUser() clears entire chat 
