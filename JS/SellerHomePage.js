const PORT = 3003;
function chatFunction() {
  document.getElementById("chooseChat").classList.toggle("show");
}
// Function to get property details from the backend
async function fetchPropertyDetails() {
  const emailOrUsername =
    localStorage.getItem("email") || localStorage.getItem("username"); // Get the email/username from localStorage

  if (!emailOrUsername) {
    alert("No email or username found in localStorage.");
    return;
  }

  try {
    // Show the loading spinner
    document.getElementById("loading").style.display = "flex";

    // Fetch the property details from the backend using the email/username
    const response = await fetch(
      `http://localhost:${PORT}/getPropertyDetails?emailOrUsername=${emailOrUsername}`
    );

    // Check if the response is successful
    if (!response.ok) {
      throw new Error("Failed to fetch property details");
    }

    const propertyData = await response.json();
    console.log(propertyData);
    // If no property data is found, show an appropriate message
    if (propertyData.length === 0) {
      document.getElementById("property-card").innerHTML =
        "<p>No properties found for this user.</p>";
      return;
    }
    // Clear any existing property cards
    const propertyContainer = document.querySelector(".propertyContainer");
    propertyContainer.innerHTML = "";
    // Loop through each property and create the property card
    propertyData.forEach((property) => {
      // Construct image URL
      const imageUrl = `JS/${property.firstImage}`;
      console.log(`Image URL: ${imageUrl}`);
      // Format the price with commas
      const formattedPrice = new Intl.NumberFormat().format(property.price);
      // Dynamically create and insert the property card into the page
      propertyContainer.innerHTML += `
      <div class="property-card">
        <div class="property-image" style="background-image: url('${imageUrl}');"></div>
        <div class="property-details">
          <div>
            <h2 class="property-title">${property.heading}</h2>
            <p class="property-description">${property.address}, ${property.city}, ${property.state}</p>
          </div>
          <div class="property-info">
            <div class="property-icons">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </div>
            <div class="property-views">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="18px" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 eye">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
              </svg>
              <p>1.2K</p>
            </div>
            <div class="property-price">Price: ₹${formattedPrice}</div>
            <div class="property-date">
              <a href="SellerForm.html?propertyId=${property.propertyId}" class="edit-button">
                <div><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" width="17px">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/>
                </svg>
                </div>
                <div>Edit</div>
              </a>
              <div>Posted: ${property.createdAtAgo}</div>
            </div>
          </div>
        </div>
      </div>
    `;
    });

    // Hide the loading spinner
    document.getElementById("loading").style.display = "none";

    // Add event listener for editing the property
    const editButtons = document.querySelectorAll(".edit-button");
    editButtons.forEach((button) => {
      button.addEventListener("click", async (event) => {
        const propertyId = event.target
          .closest(".edit-button")
          .getAttribute("data-id");
        await openEditForm(propertyId);
      });
    });
  } catch (error) {
    console.error("Error fetching property details:", error);
    document.querySelector(".propertyContainer").innerHTML =
      "<p>No Property Added yet.</p>";

    document.getElementById("loading").style.display = "none"; // Hide the loading spinner
  }
}

// Function to check if a property can be edited
function canEditProperty(propertyId) {
  console.log(propertyId);
  let editCount = localStorage.getItem(`editCount_${propertyId}`);

  if (!editCount) {
    localStorage.setItem(`editCount_${propertyId}`, 0);
    editCount = 0;
  }

  if (editCount < 3) {
    return true;
  } else {
    return false;
  }
}

// Function to update the property edit count
function updateEditCount(propertyId) {
  console.log(propertyId);
  let editCount = parseInt(localStorage.getItem(`editCount_${propertyId}`));

  editCount += 1;

  localStorage.setItem(`editCount_${propertyId}`, editCount);
}

// Function to open the edit form with the property details
async function openEditForm(propertyId) {
  if (!canEditProperty(propertyId)) {
    alert("You have reached the maximum number of edits for this property.");
    return;
  }

  const response = await fetch(
    `http://localhost:${PORT}/getPropertyDetailsById?id=${propertyId}`
  );
  const property = await response.json();

  if (property) {
    document.getElementById("property-heading").value = property.heading;
    document.getElementById("property-address").value = property.address;
    document.getElementById("property-city").value = property.city;
    document.getElementById("property-state").value = property.state;
    document.getElementById("property-price").value = property.price;
    document.getElementById("edit-property-id").value = property._id;

    document.getElementById("edit-property-form").style.display = "block";

    // After the edit form is opened, update the edit count
    updateEditCount(propertyId);
  }
}

//for payment
const PORT_DI = 3001;
// Function to fetch userId using the username
async function getUserIdFromUsername(username) {
  try {
    const response = await fetch(`http://localhost:${PORT_DI}/getUserId`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }), // Send the username in the body
    });

    if (response.ok) {
      const data = await response.json();
      if (data.userId) {
        console.log("User ID fetched: ", data.userId);
        return data.userId; // Return the userId
      } else {
        console.error("User not found");
      }
    } else {
      throw new Error("Failed to fetch userId");
    }
  } catch (error) {
    console.error("Error fetching userId:", error);
  }
  return null; // Return null if an error occurs
}

// Function to check if the user has already added a property
async function checkUserProperties(userId) {
  try {
    const response = await fetch(
      `http://localhost:3006/user-properties-count?userId=${userId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();
    console.log("Property count response:", data.propertyCount); // Log the response

    if (data.propertyCount >= 1) {
      checkSubscriptionStatus(userId); // User has added a property, check subscription
    } else {
      window.location.href = "SellerForm.html"; // Redirect to property form
    }
  } catch (error) {
    console.error("Error checking user properties:", error);
  }
}

// Function to check the user's subscription status
async function checkSubscriptionStatus(userId) {
  try {
    const response = await fetch(
      `http://localhost:3006/check-subscription?userId=${userId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();
    console.log(data.propertyCount);
    console.log(data.active);
    console.log(data.remainingLimit);

    // Check if subscription is active and if there are remaining properties within the limit
    if (!data.active) {
      window.location.href = "Payment.html"; // Redirect to payment page if subscription is inactive
    } else {
      // If subscription is active and there are remaining limits for properties
      if (data.remainingLimit === "Unlimited" || data.remainingLimit > 0) {
        window.location.href = "SellerForm.html"; // Redirect to property form if subscription is active and there are limits left
      } else {
        // If no remaining limit for properties, redirect to payment page
        window.location.href = "Payment.html";
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Function to check subscription status
// async function checkSubscription(userId) {
//   const userId = userId; // Replace with actual user ID

//   try {
//     const response = await fetch(`/check-subscription?userId=${userId}`);
//     const data = await response.json();

//     if (data.active) {
//       document.getElementById("subscriptionMessage").innerText =
//         "Your subscription is active!";
//       document.getElementById("addPropertyButton").style.display = "block"; // Show Add Property button
//     } else {
//       document.getElementById("subscriptionMessage").innerText =
//         "Your subscription is inactive. Please make a payment.";
//       document.getElementById("paymentOptions").style.display = "block"; // Show payment options
//     }
//   } catch (error) {
//     console.error("Error checking subscription:", error);
//   }
// }

// Call the check subscription function when the page loads
// window.onload = checkSubscription;
// Event listener for the "Add Property" button
document
  .getElementById("addPropertyButton")
  .addEventListener("click", async (event) => {
    event.preventDefault();
    const username = localStorage.getItem("username"); // Get username from localStorage
    const userId = await getUserIdFromUsername(username);
    if (userId) {
      const profileExists = await checkSellerProfile(userId); // Check if the seller's profile exists

      if (!profileExists) {
        // If the profile doesn't exist, redirect to the seller profile creation page
        window.location.href = "SProfileForSeller.html";
      } else {
        // Profile exists, proceed with the property adding process
        checkUserProperties(userId); // Check user properties
      }
    }
  });

// Function to check if the seller's profile exists
async function checkSellerProfile(userId) {
  try {
    const response = await fetch(
      `http://localhost:${PORT}/api/checkSellerProfile?userId=${userId}`
    );
    const data = await response.json();
    console.log(data.profileExists);
    // Return the profile existence status
    return data.profileExists;
  } catch (error) {
    console.error("Error checking seller profile:", error);
    return false;
  }
}
// // Function to get the paymentId and orderId from Pabbly Webhook
// async function getPaymentDetailsFromPabbly(userId) {
//   try {
//     const response = await fetch(
//       `https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjYwNTY5MDYzNzA0MzM1MjZlNTUzMTUxMzMi_pc`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           userId: userId, // Send the userId to fetch payment details
//         }),
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Failed to fetch payment details");
//     }

//     const data = await response.json();
//     const { payment_id, order_id } = data; // Assuming the response contains these fields

//     if (payment_id && order_id) {
//       return { payment_id, order_id };
//     } else {
//       throw new Error("Payment or Order ID missing in response");
//     }
//   } catch (error) {
//     console.error("Error fetching payment details from Pabbly:", error);
//     return null;
//   }
// }
// async function getPaymentDetails() {
//   const username = localStorage.getItem("username"); // Get the username from localStorage
//   const userId = await getUserIdFromUsername(username); // Get the userId based on the username

//   if (userId) {
//     // Once you have the userId, pass it to getPaymentDetailsFromPabbly
//     const { paymentId, orderId } = await getPaymentDetailsFromPabbly(userId);

//     if (paymentId && orderId) {
//       // Send payment details to your backend
//       await fetch("http://localhost:3006/payment-success", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           userId: userId,
//           paymentId: paymentId,
//           orderId: orderId,
//         }),
//       });
//     }
//   }
// }
// getPaymentDetails();

// async function initiatePayment(plan, paymentButtonId) {
//   console.log(plan, paymentButtonId);
//   const username = localStorage.getItem("username"); // Get username from localStorage
//   const userId = await getUserIdFromUsername(username);
//   const response = await fetch("/process-payment", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ userId: userId, plan: plan }),
//   });
//   const data = await response.json();
//   const options = {
//     key: data.key,
//     amount:
//       plan === "1 month"
//         ? 99 * 100
//         : plan === "6 months"
//         ? 499 * 100
//         : 899 * 100,
//     currency: "INR",
//     order_id: data.orderId,
//     handler: async function (response) {
//       await fetch("/payment-success", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           // payment_id: response.razorpay_payment_id,
//           // order_id: response.razorpay_order_id,
//           userID: userId,
//         }),
//       });
//     },
//   };

//   const paymentObject = new Razorpay(options);
//   paymentObject.open();
// }

// // Attach event listeners to all Razorpay script tags
// document.querySelectorAll(".buy-button").forEach((script) => {
//   script.addEventListener("click", function () {
//     const plan = this.getAttribute("data-plan"); // Get the plan from the data attribute
//     const paymentButtonId = this.getAttribute("data-payment_button_id"); // Get the Razorpay payment button ID
//     initiatePayment(plan, paymentButtonId); // Call the function with the selected plan and payment button ID
//   });
// });
// On page load, fetch property details
window.onload = function () {
  fetchPropertyDetails();
};
