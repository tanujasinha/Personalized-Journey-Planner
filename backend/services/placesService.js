// backend/services/placesService.js - Add a service to interact with Google Places API
const axios = require('axios');

class PlacesService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
  }

  async searchPlacesByDestination(destination, type = '') {
    try {
      const response = await axios.get(`${this.baseUrl}/textsearch/json`, {
        params: {
          query: `tourist attractions in ${destination}`,
          type: type,
          key: this.apiKey
        }
      });
      return response.data.results;
    } catch (error) {
      console.error('Error fetching places:', error);
      throw error;
    }
  }

  async getPlaceDetails(placeId) {
    try {
      const response = await axios.get(`${this.baseUrl}/details/json`, {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,rating,photos,url,website,geometry,editorial_summary,price_level,reviews,types',
          key: this.apiKey
        }
      });
      return response.data.result;
    } catch (error) {
      console.error('Error fetching place details:', error);
      throw error;
    }
  }

  async searchPlacesByInterest(destination, interest) {
    const interestMap = {
      'adventure': ['amusement_park', 'zoo', 'aquarium', 'stadium', 'park'],
      'history': ['museum', 'art_gallery', 'church', 'hindu_temple', 'mosque', 'synagogue', 'landmark'],
      'food': ['restaurant', 'cafe', 'bakery', 'bar', 'food'],
      'nature': ['park', 'campground', 'natural_feature', 'beach', 'bay', 'lake']
    };

    const types = interestMap[interest.toLowerCase()] || [];
    let allPlaces = [];

    for (const type of types) {
      try {
        const query = `${type} in ${destination}`;
        const response = await axios.get(`${this.baseUrl}/textsearch/json`, {
          params: {
            query: query,
            key: this.apiKey
          }
        });
        allPlaces = [...allPlaces, ...response.data.results];
      } catch (error) {
        console.error(`Error fetching places for ${type}:`, error);
      }
    }

    // Remove duplicates
    const uniquePlaces = Array.from(new Map(allPlaces.map(place => [place.place_id, place])).values());
    return uniquePlaces;
  }

  async getPhotoUrl(photoReference, maxWidth = 400) {
    return `${this.baseUrl}/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${this.apiKey}`;
  }
}

module.exports = PlacesService;