// Initialize Mapbox map
mapboxgl.accessToken = "YOUR_MAPBOX_ACCESS_TOKEN";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  center: [0, 0],
  zoom: 2,
});

// Function to fetch properties and geocode addresses
async function fetchAllProperties() {
  try {
    const response = await fetch("http://localhost:3001/getAllProperties");
    if (!response.ok) throw new Error("Failed to fetch properties");

    const properties = await response.json();
    for (const property of properties) {
      const coordinates = await getCoordinates(property.address);
      if (coordinates) {
        addPropertyMarker(coordinates, property);
      }
    }
    return properties;
  } catch (error) {
    console.error("Error fetching properties:", error);
    return [];
  }
}

// Function to geocode address to coordinates
async function getCoordinates(address) {
  try {
    const geocodingResponse = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address
      )}.json?access_token=${mapboxgl.accessToken}`
    );
    const geocodingData = await geocodingResponse.json();
    if (geocodingData.features && geocodingData.features.length > 0) {
      return geocodingData.features[0].center; // [longitude, latitude]
    }
    return null;
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
}

// Function to add a marker for each property
function addPropertyMarker(coordinates, property) {
  const marker = new mapboxgl.Marker().setLngLat(coordinates).addTo(map);

  const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
    `<h3>${property.heading}</h3><p>${property.address}</p>`
  );

  marker.setPopup(popup);
}

// Initialize the map
async function initializeMap() {
  const properties = await fetchAllProperties();
  if (properties.length > 0) {
    const firstPropertyCoordinates = await getCoordinates(
      properties[0].address
    );
    if (firstPropertyCoordinates) {
      map.setCenter(firstPropertyCoordinates);
      map.setZoom(10); // Zoom level
    }
  }
}

initializeMap();
