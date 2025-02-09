const API_KEY = "AIzaSyBNBz05qR1gO9DpyqBpG2bFD2FyQuLyMJo";

// Function to fetch address predictions (autocomplete)
const getAddressPredictions = async (address) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${address}&key=${API_KEY}`
    );
    const data = await response.json();
    console.log(data);
    return data.predictions || [];
  } catch (error) {
    console.error("Error fetching address predictions:", error);
    return [];
  }
};

// Function to get coordinates based on place ID
const getCoordinates = async (placeId) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`
    );
    const data = await response.json();

    if (data.status === "OK") {
      const location = data.result.geometry.location;
      return location;
    } else {
      console.error("Unable to retrieve coordinates.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
};

// Main function to autocomplete address and retrieve coordinates
const handleAddressSearch = async (addressInput) => {
  const predictions = await getAddressPredictions(addressInput);

  if (predictions.length > 0) {
    // Log predictions (for autocomplete suggestions)
    console.log("Address Suggestions:");
    predictions.forEach((prediction, index) => {
      console.log(`${index + 1}. ${prediction.description}`);
    });

    // Optionally, you can choose one prediction manually, e.g. by index
    const selectedPlaceId = predictions[0].place_id; // Example: Select the first suggestion

    // Get coordinates for the selected address
    const coordinates = await getCoordinates(selectedPlaceId);

    if (coordinates) {
      console.log("Coordinates:");
      console.log(`Latitude: ${coordinates.lat}`);
      console.log(`Longitude: ${coordinates.lng}`);
    }
  } else {
    console.log("No address predictions found.");
  }
};

// Example usage
const addressInput = "1600 Amphitheatre"; // Example input address
handleAddressSearch(addressInput);
