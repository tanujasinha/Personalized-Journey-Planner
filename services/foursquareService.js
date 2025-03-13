const axios = require('axios');
require('dotenv').config();

const FOURSQUARE_API_KEY = process.env.FOURSQUARE_API_KEY;

const fetchPlaces = async (query, near) => {
    try {
        const response = await axios.get('https://api.foursquare.com/v3/places/search', {
            headers: {
                'Authorization': FOURSQUARE_API_KEY
            },
            params: {
                query,
                near
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching places from Foursquare:', error);
        throw error;
    }
};

module.exports = {
    fetchPlaces
};
