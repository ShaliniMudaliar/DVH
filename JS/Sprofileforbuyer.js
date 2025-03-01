document.addEventListener("DOMContentLoaded", async function() {
    // Retrieve stored seller details (assumed to be saved previously)
    const userId = localStorage.getItem("UserID");
    const email = localStorage.getItem("email");
    
    if (!userId || !email) {
      console.error("Seller UserID or email not found in localStorage");
      // Optionally redirect to a login or error page.
      return;
    }
    
    try {
      // Build request URL with query parameters
      const requestUrl = `http://127.0.0.1:5002/api/sellerDetails?userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(email)}`;
      const response = await fetch(requestUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const sellerData = await response.json();
      console.log("Fetched seller data:", sellerData);
      
      function setTextContent(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.innerText = text || "N/A"; // Fallback in case of empty values
        } else {
            console.warn(`Element with ID '${id}' not found`);
        }
    }

    // Populate profile header
    setTextContent("name", `${sellerData.firstName} ${sellerData.lastName}`);
    setTextContent("age", sellerData.age);
    setTextContent("city", sellerData.city);
    setTextContent("state", sellerData.state);
    setTextContent("country", sellerData.country);
    setTextContent("zip", sellerData.zipCode);
    setTextContent("phone", sellerData.contactNumber);
    setTextContent("email", sellerData.email);

    // Populate Agent details if available
    if (sellerData.agentData) {
        setTextContent("agent-description", sellerData.agentData.description);
        setTextContent("agent-agency", sellerData.agentData.agency);
        setTextContent("agent-license", sellerData.agentData.agentLicense);
        setTextContent("agent-tax-number", sellerData.agentData.taxNumber);
        // setTextContent("agent-service-area", sellerData.agentData.serviceArea);
    }
 generateProfileAvatar(sellerData.firstName, sellerData.lastName,userId);
 
const requestUrl_property=`http://127.0.0.1:5002/api/getActiveListings?userId=${encodeURIComponent(userId)}}`;

fetch(requestUrl_property, { method: "GET" })
  .then(response => {
    if (!response.ok) throw new Error("Failed to fetch property listings");
    return response.json();
  })
  .then(data => {
    const listingsContainer = document.getElementById("active-listings-container");

    if (!listingsContainer) {
      console.error("Container not found in HTML");
      return;
    }

    if (!data.listings || data.listings.length === 0) {
      listingsContainer.innerHTML = "<p>No active listings found.</p>";
      return;
    }

    listingsContainer.innerHTML = ""; // Clear existing content

    data.listings.forEach(listing => {
      const propertyCard = `
        <div class="property-card">
          <div class="property-image" style="background-image: url('${listing.photos[1] || 'default-image.jpg'}');"></div>
          <div class="property-details">
            <h2 class="property-title">${listing.heading}</h2>
            <p class="property-description">${listing.address}</p>
            <div class="property-info">
              <p class="property-price"> ₹${listing.price}</p>
              <p class="property-price"> ${listing.squareFeet}</p>
              <p class="property-date"><strong>Posted : </strong> ${listing.createdAt}</p>
            </div>
          </div>
        </div>`;

      listingsContainer.innerHTML += propertyCard;
    });
  })
  .catch(error => console.error("Error fetching listings:", error));
  const response1 = await fetch(`http://127.0.0.1:5002/api/getPropertyStats?userId=${encodeURIComponent(userId)}`);
  if (!response1.ok) throw new Error("Failed to fetch property statistics");

  const data = await response1.json(); // Clone response to prevent stream error
  console.log("Fetched Property Stats:", data);

  updateCharts(data.totalListings, data.propertiesSold, data.propertiesRent);


  }catch (error) {
      console.error("Error fetching seller profile:", error);
      document.querySelector(".active-listings").innerHTML = "<p>Error loading listings</p>";
    }
  });
  
  function generateProfileAvatar(firstName, lastName, userId) {
    const avatarElement = document.getElementById("profile-avatar");
    
    if (!avatarElement){
        console.error("Profile avatar element not found."); 
        return;
    }

    // Extract initials (handling missing names)
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";
    const initials = `${firstInitial}${lastInitial}`;

   // Generate a fixed color based on user ID (or email as fallback)
   const color = generateColorFromString(userId || firstName + lastName);

    // Apply styles
    avatarElement.innerText = initials;
    avatarElement.style.backgroundColor = color;
}

//Function to generate a unique color based on user ID or name
function generateColorFromString(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = input.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360); // Convert hash to a valid HSL hue
    return `hsl(${hue}, 60%, 50%)`; // Use HSL to get a distinct color
}


// Function to update the charts dynamically
function updateCharts(totalListings, propertiesSold, propertiesRent) {
      // ✅ Update numbers in HTML
      document.getElementById("totalListingsCount").innerText = totalListings;
      document.getElementById("propertiesSoldCount").innerText = propertiesSold;
      document.getElementById("propertiesRentCount").innerText = propertiesRent;

    const ctx1 = document.getElementById("totalListingsChart").getContext("2d");
    new Chart(ctx1, {
        type: "doughnut",
        data: {
            datasets: [{
                data: [totalListings, totalListings-1], 
                backgroundColor: ["#2ecc71", "#e5e5e5"],
                borderWidth: 2
            }]
        },
        options: {
            cutout: "70%",
            responsive: false,
            plugins: { legend: { display: false } }
        }
    });

    const ctx2 = document.getElementById("propertiesSoldChart").getContext("2d");
    new Chart(ctx2, {
        type: "doughnut",
        data: {
            datasets: [{
                data: [propertiesSold, totalListings - propertiesSold],
                backgroundColor: ["#e74c3c", "#e5e5e5"],
                borderWidth: 2
            }]
        },
        options: {
            cutout: "70%",
            responsive: false,
            plugins: { legend: { display: false } }
        }
    });

    const ctx3 = document.getElementById("propertiesRentChart").getContext("2d");
    new Chart(ctx3, {
        type: "doughnut",
        data: {
            datasets: [{
                data: [propertiesRent, totalListings - propertiesRent],
                backgroundColor: ["#3498db", "#e5e5e5"],
                borderWidth: 2
            }]
        },
        options: {
            cutout: "70%",
            responsive: false,
            plugins: { legend: { display: false } }
        }
    });
}

 
 
//  // Chart for Total Listings
//  var ctx1 = document.getElementById('totalListingsChart').getContext('2d');
//  var totalListingsChart = new Chart(ctx1, {
//      type: 'doughnut',
//      data: {
//          datasets: [{
//              data: [1200,1700],
//              backgroundColor: ['#2ecc71', '#e5e5e5'],
//              borderWidth: 2
//          }]
//      },
//      options: {
//          cutout: '70%',
//          responsive: false,
//          plugins: {
//              legend: { display: false }
//          }
//      }
//  });

//  // Chart for Properties Sold
//  var ctx2 = document.getElementById('propertiesSoldChart').getContext('2d');
//  var propertiesSoldChart = new Chart(ctx2, {
//      type: 'doughnut',
//      data: {
//          datasets: [{
//              data: [900, 300],
//              backgroundColor: ['#e74c3c', '#e5e5e5'],
//              borderWidth: 2
//          }]
//      },
//      options: {
//          cutout: '70%',
//          responsive: false,
//          plugins: {
//              legend: { display: false }
//          }
//      }
//  });

//  // Chart for Properties Rent
//  var ctx3 = document.getElementById('propertiesRentChart').getContext('2d');
//  var propertiesRentChart = new Chart(ctx3, {
//      type: 'doughnut',
//      data: {
//          datasets: [{
//              data: [300, 900],
//              backgroundColor: ['#3498db', '#e5e5e5'],
//              borderWidth: 2
//          }]
//      },
//      options: {
//          cutout: '70%',
//          responsive: false,
//          plugins: {
//              legend: { display: false }
//          }
//      }
//  });