//backend/routes/tripRoutes.js

const express = require("express");
const router = express.Router();
const Itinerary = require("../models/Itinerary");
const PlacesService = require("../services/placesService");
const WeatherService = require("../services/weatherService");
const TransportService = require("../services/transportService");

// Middleware to verify token
const verifyToken = require("../middleware/auth");

// Generate itinerary
router.post("/plan",verifyToken, async (req, res) => {
    try {
        const { destination, days, interests, budget ,startDate} = req.body;

         
    // Initialize services with API keys
    const placesService = new PlacesService(process.env.GOOGLE_PLACES_API_KEY);
    const weatherService = new WeatherService(process.env.OPENWEATHER_API_KEY);
    const transportService = new TransportService();
    
    // 1. Get places based on destination and interests
    let allPlaces = [];

        // First get general tourist attractions
    const generalPlaces = await placesService.searchPlacesByDestination(destination);
    allPlaces = [...generalPlaces];
    
    // Then get places based on selected interests
    for (const interest of interests) {
      const interestPlaces = await placesService.searchPlacesByInterest(destination, interest);
      allPlaces = [...allPlaces, ...interestPlaces];
    }
    
    // Remove duplicates and sort by rating
    const uniquePlaces = Array.from(
      new Map(allPlaces.map(place => [place.place_id, place])).values()
    ).sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    // 2. Get weather forecast
    const weatherForecast = await weatherService.getForecast(destination, days);
    
    // 3. Prepare itinerary data
    const startDateObj = startDate ? new Date(startDate) : new Date();
    const dailyBudget = days > 0 ? budget / days : 0;
    const itineraryData = [];
    
    // Calculate places per day based on total places and days
    const placesPerDay = Math.min(4, Math.ceil(uniquePlaces.length / days));
    
    for (let i = 0; i < days; i++) {
      const dayDate = new Date(startDateObj);
      dayDate.setDate(startDateObj.getDate() + i);
      
      // Get places for this day
      const dayPlaces = uniquePlaces.slice(i * placesPerDay, (i + 1) * placesPerDay)
        .map(place => {
          // Assign random costs for budget estimation
          const entryCost = Math.floor(Math.random() * 20) + 5;
          
          return {
            name: place.name,
            placeId: place.place_id,
            description: place.vicinity || 'A popular attraction in ' + destination,
            address: place.formatted_address || place.vicinity,
            photos: place.photos ? [placesService.getPhotoUrl(place.photos[0].photo_reference)] : [],
            rating: place.rating,
            types: place.types,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            visitDuration: 90, // Default 90 minutes per place
            cost: entryCost
          };
        });
      
      // Daily transport cost estimation
      const transportationCost = Math.floor(Math.random() * 30) + 10;
      
      // Daily accommodation cost (20-30% of daily budget)
      const accommodationCost = Math.floor(dailyBudget * (0.2 + Math.random() * 0.1));
      
      // Daily food cost (15-25% of daily budget)
      const foodCost = Math.floor(dailyBudget * (0.15 + Math.random() * 0.1));
      
      // Calculate total day cost
      const placesCost = dayPlaces.reduce((sum, place) => sum + place.cost, 0);
      const dayCost = placesCost + transportationCost + accommodationCost + foodCost;
      
      // Get weather for this day if available
      const dayWeather = weatherForecast[i] || {
        temperature: { avg: 20 },
        condition: 'Unknown',
        icon: '01d'
      };
      
      itineraryData.push({
        day: i + 1,
        date: dayDate,
        places: dayPlaces,
        activities: [
          {
            name: 'Sightseeing',
            description: 'Explore the attractions in ' + destination,
            duration: 240,
            cost: 0
          },
          {
            name: 'Local Cuisine Experience',
            description: 'Taste authentic local food',
            duration: 120,
            cost: Math.floor(foodCost / 3)
          }
        ],
        meals: [
          {
            type: 'breakfast',
            place: 'Local café',
            cost: Math.floor(foodCost * 0.2)
          },
          {
            type: 'lunch',
            place: 'Restaurant near attractions',
            cost: Math.floor(foodCost * 0.3)
          },
          {
            type: 'dinner',
            place: 'Popular local restaurant',
            cost: Math.floor(foodCost * 0.5)
          }
        ],
        accommodation: {
          name: 'Hotel in ' + destination,
          address: destination + ' city center',
          cost: accommodationCost
        },
        transportation: [
          {
            type: 'local transit',
            from: 'Accommodation',
            to: 'Attractions',
            cost: transportationCost,
            duration: 30
          }
        ],
        weatherForecast: {
          temperature: dayWeather.temperature.avg,
          condition: dayWeather.condition,
          icon: dayWeather.icon
        },
        dayCost: dayCost
      });
    }
    
    // Calculate total cost
    const totalCost = itineraryData.reduce((sum, day) => sum + day.dayCost, 0);
    
    // 4. Save itinerary to database
    const newItinerary = new Itinerary({
      destination,
      days,
      interests,
      budget,
      totalCost,
      userId: req.user ? req.user.id : null,
      itinerary: itineraryData
    });
    
    await newItinerary.save();
    
    res.status(201).json(newItinerary);
  } catch (error) {
    console.error("Error generating itinerary:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all itineraries (optional: filter by user if authenticated)
router.get("/", async (req, res) => {
  try {
    // If user is authenticated, filter by userId
    const filter = req.user ? { userId: req.user.id } : {};
    const itineraries = await Itinerary.find(filter);
    res.json(itineraries);
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get itinerary by ID
router.get("/:id", async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }
    res.json(itinerary);
  } catch (error) {
    console.error("Error fetching itinerary:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;