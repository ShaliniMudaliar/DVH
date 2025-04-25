document.addEventListener("DOMContentLoaded", async function () {
  const storedProperty = sessionStorage.getItem("selectedProperty");
  const selectedProperty = JSON.parse(storedProperty);
  const userId = selectedProperty?.userId;
  const email = localStorage.getItem("email");

  if (!userId) {
    console.error("Seller UserID not found in sessionStorage");
    return;
  }

  try {
    const requestUrl = `http://127.0.0.1:5002/api/sellerDetails?userId=${encodeURIComponent(
      userId
    )}&email=${encodeURIComponent(email)}`;

    const response = await fetch(requestUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const sellerData = await response.json();
    console.log("Fetched seller data:", sellerData);

    function setTextContent(id, text) {
      const element = document.getElementById(id);
      if (element) {
        element.innerText = text || "N/A";
      } else {
        console.warn(`Element with ID '${id}' not found`);
      }
    }

    setTextContent("name", `${sellerData.firstName} ${sellerData.lastName}`);
    setTextContent("age", sellerData.age);
    setTextContent("city", sellerData.city);
    setTextContent("state", sellerData.state);
    setTextContent("country", sellerData.country);
    setTextContent("zip", sellerData.zipCode);
    setTextContent("phone", sellerData.contactNumber);
    setTextContent("email", sellerData.email);

    const detailsDiv = document.querySelector(".details");
    if (sellerData.agentData) {
      setTextContent("agent-description", sellerData.agentData.description);
      setTextContent("agent-agency", sellerData.agentData.agency);
      setTextContent("agent-license", sellerData.agentData.agentLicense);
      setTextContent("agent-tax-number", sellerData.agentData.taxNumber);
      detailsDiv.hidden = false;
    } else {
      detailsDiv.hidden = true;
    }

    generateProfileAvatar(sellerData.firstName, sellerData.lastName, userId);

    function timeAgo(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now - date) / 1000);
      const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
      };

      for (const [unit, value] of Object.entries(intervals)) {
        const count = Math.floor(seconds / value);
        if (count >= 1) {
          return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
        }
      }

      return "Just now";
    }

    const requestUrl_property = `http://127.0.0.1:5002/api/getActiveListings?userId=${encodeURIComponent(
      userId
    )}`;

    let propertyData = [];

    fetch(requestUrl_property, { method: "GET" })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch property listings");
        return response.json();
      })
      .then((data) => {
        propertyData = data.listings;
        const listingsContainer = document.getElementById(
          "active-listings-container"
        );

        if (!listingsContainer) {
          console.error("Container not found in HTML");
          return;
        }

        if (!data || !data.listings || data.listings.length === 0) {
          listingsContainer.innerHTML = "<p>No active listings found.</p>";
          return;
        }

        listingsContainer.innerHTML = "";

        data.listings.forEach((property) => {
          const imageUrl = property.photos?.[0] || "default-image.jpg";
          const timeAgoText = timeAgo(property.createdAt);
          const propertyCard = document.createElement("div");
          propertyCard.classList.add("property-card");
          propertyCard.setAttribute("data-property-id", property.propertyId);

          propertyCard.innerHTML = `
            <div class="property-image" style="background-image: url('JS/${imageUrl}');"></div>
            <div class="property-details">
              <h2 class="property-title">${property.heading}</h2>
              <p class="property-description">${property.address}</p>
              <div class="property-info">
                <p class="property-price"><strong>Price:</strong> ₹${property.price}</p>
                <p class="property-price"><strong>Size:</strong> ${property.squareFeet}</p>
                <p class="property-date"><strong>Posted:</strong> ${timeAgoText}</p>
              </div>
            </div>
          `;

          listingsContainer.appendChild(propertyCard);
          // Add click event listener to the card
          propertyCard.addEventListener("click", () => {
            console.log("Property selected:", property);
            sessionStorage.setItem(
              "selectedProperty",
              JSON.stringify(property)
            );
            window.location.href = "/itemPage.html";
          });
        });
      })
      .catch((error) => console.error("Error fetching listings:", error));

    const response1 = await fetch(
      `http://127.0.0.1:5002/api/getPropertyStats?userId=${encodeURIComponent(
        userId
      )}`
    );

    if (!response1.ok) throw new Error("Failed to fetch property statistics");

    const data = await response1.json();
    console.log("Fetched Property Stats:", data);

    updateCharts(data.totalListings, data.propertiesSold, data.propertiesRent);
  } catch (error) {
    console.error("Error fetching seller profile:", error);
    document.querySelector(".active-listings").innerHTML =
      "<p>Error loading listings</p>";
  }
});

function generateProfileAvatar(firstName, lastName, userId) {
  const avatarElement = document.getElementById("profile-avatar");
  if (!avatarElement) {
    console.error("Profile avatar element not found.");
    return;
  }

  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";
  const initials = `${firstInitial}${lastInitial}`;
  const color = generateColorFromString(userId || firstName + lastName);

  avatarElement.innerText = initials;
  avatarElement.style.backgroundColor = color;
}

function generateColorFromString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 60%, 50%)`;
}

function updateCharts(totalListings, propertiesSold, propertiesRent) {
  document.getElementById("totalListingsCount").innerText = totalListings;
  document.getElementById("propertiesSoldCount").innerText = propertiesSold;
  document.getElementById("propertiesRentCount").innerText = propertiesRent;

  const ctx1 = document.getElementById("totalListingsChart").getContext("2d");
  new Chart(ctx1, {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [totalListings, totalListings - 1],
          backgroundColor: ["#2ecc71", "#e5e5e5"],
          borderWidth: 2,
        },
      ],
    },
    options: {
      cutout: "70%",
      responsive: false,
      plugins: { legend: { display: false } },
    },
  });

  const ctx2 = document.getElementById("propertiesSoldChart").getContext("2d");
  new Chart(ctx2, {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [propertiesSold, totalListings - propertiesSold],
          backgroundColor: ["#e74c3c", "#e5e5e5"],
          borderWidth: 2,
        },
      ],
    },
    options: {
      cutout: "70%",
      responsive: false,
      plugins: { legend: { display: false } },
    },
  });

  const ctx3 = document.getElementById("propertiesRentChart").getContext("2d");
  new Chart(ctx3, {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [propertiesRent, totalListings - propertiesRent],
          backgroundColor: ["#3498db", "#e5e5e5"],
          borderWidth: 2,
        },
      ],
    },
    options: {
      cutout: "70%",
      responsive: false,
      plugins: { legend: { display: false } },
    },
  });
}
