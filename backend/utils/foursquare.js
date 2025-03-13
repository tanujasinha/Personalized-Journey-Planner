//backend/utils/foursquare.js

const axios = require("axios");

const getPlacesFromFoursquare = async (location, interests) => {
    const apiKey = process.env.FOURSQUARE_API_KEY;
    const category = interests.join(","); // Convert interests array into string
    const url = `https://api.foursquare.com/v3/places/search?near=${location}&categories=${category}&limit=10`;

    try {
        const response = await axios.get(url, {
            headers: { "Authorization": `Bearer ${apiKey}` }
        });
        return response.data.results || []; // List of places
    } catch (error) {
        console.error("Foursquare API Error:", error.response?.data || error.message);
        return [];
    }
};

module.exports = getPlacesFromFoursquare;
