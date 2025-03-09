// Function to fetch userId using the username
async function getUserIdFromUsername(username) {
  try {
    const response = await fetch("http://localhost:3001/getUserId", {
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
// Function to initiate the payment process
async function initiatePayment(plan, paymentButtonId) {
  console.log(plan, paymentButtonId);
  const username = localStorage.getItem("username"); // Get username from localStorage
  const userId = await getUserIdFromUsername(username); // Fetch userId

  // Request to backend to generate Razorpay order details
  const response = await fetch("http://localhost:3006/process-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: userId, plan: plan }),
  });

  const data = await response.json();
  console.log(data); // Log the data to check if 'key' and 'orderId' are present

  // Ensure the Razorpay key is present in the response
  if (!data.key) {
    console.error("Razorpay key is missing");
    return; // Stop if the key is missing
  }

  // Prepare the Razorpay payment options
  const options = {
    key: data.key, // Razorpay key
    amount:
      plan === "1 month"
        ? 99 * 100
        : plan === "6 month"
        ? 499 * 100
        : 899 * 100, // Dynamic amount based on plan
    currency: "INR",
    order_id: data.orderId, // Order ID from backend
    handler: async function (paymentResponse) {
      // Handle successful payment and notify backend
      try {
        const successResponse = await fetch(
          "http://localhost:3006/payment-success",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userID: userId, // Send the userId to the backend
              plan: plan, // Send the plan to the backend
            }),
          }
        );

        const successData = await successResponse.json();
        if (successData.success) {
          console.log("Payment success and subscription updated");

          // Redirect to the next page after success
          window.location.href = "SellerHomePage.html"; // Change the URL to your desired page
        } else {
          console.error("Error updating subscription: ", successData.error);
        }
      } catch (error) {
        console.error("Error notifying backend about payment success: ", error);
      }
    },
  };

  // Open Razorpay modal
  const paymentObject = new Razorpay(options);
  paymentObject.open();
}

// Attach event listeners to the Razorpay buttons after they are loaded
document.querySelectorAll(".buy-button").forEach((button) => {
  button.addEventListener("click", function () {
    const plan = this.getAttribute("data-plan"); // Get the plan from the data attribute
    const paymentButtonId = this.getAttribute("data-payment_button_id"); // Get the payment button ID
    initiatePayment(plan, paymentButtonId); // Call the function to handle payment
  });
});
