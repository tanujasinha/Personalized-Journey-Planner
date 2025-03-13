//backend/utils/googleMaps.js
const axios = require("axios");

const getRouteFromGoogleMaps = async (origin, destination, travelMode = "driving") => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${travelMode}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        return response.data.routes[0] || null; // Best route
    } catch (error) {
        console.error("Google Maps API Error:", error.response?.data || error.message);
        return null;
    }
};

module.exports = getRouteFromGoogleMaps;
