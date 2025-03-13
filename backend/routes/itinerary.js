//backend/routes/itinerary.js
const express = require("express");
const Itinerary = require("../models/Itinerary");
const auth = require("../middleware/auth");
const getPlacesFromFoursquare = require("../utils/foursquare");
const getRouteFromGoogleMaps = require("../utils/googleMaps");
const getWeatherForecast = require("../utils/weather");

const router = express.Router();

// Create a new itinerary
router.post("/create", auth, async (req, res) => {
    try {
        const { destination, days, interests, budget } = req.body;

        // Fetch places using Foursquare API
        const places = await getPlacesFromFoursquare(destination, interests);

        // Divide places across `days`
        let itineraryDays = [];
        for (let i = 0; i < days; i++) {
            let placesForDay = places.slice(i * 3, (i + 1) * 3);
            
            // Fetch weather for the destination
            const weather = await getWeatherForecast(placesForDay[0]?.lat, placesForDay[0]?.lng);

            // Assign transport between places
            let transportDetails = [];
            for (let j = 0; j < placesForDay.length - 1; j++) {
                let route = await getRouteFromGoogleMaps(
                    placesForDay[j].name,
                    placesForDay[j + 1].name,
                    "driving"
                );
                transportDetails.push({
                    type: "car",
                    from: placesForDay[j].name,
                    to: placesForDay[j + 1].name,
                    cost: Math.floor(Math.random() * 20) + 10, // Example transport cost
                    duration: route?.legs[0]?.duration?.value / 60 || 30
                });
            }

            // Assign meals and accommodation
            let meals = [
                { type: "breakfast", place: "Hotel Breakfast", cost: 10 },
                { type: "lunch", place: "Local Restaurant", cost: 20 },
                { type: "dinner", place: "Fine Dining", cost: 30 }
            ];
            let accommodation = { name: "City Hotel", address: "Main Street", cost: 100 };

            // Calculate day cost
            let dayCost = meals.reduce((sum, meal) => sum + meal.cost, 0) + accommodation.cost + transportDetails.reduce((sum, t) => sum + t.cost, 0);

            // Add to itinerary
            itineraryDays.push({
                day: i + 1,
                date: new Date(Date.now() + i * 86400000),
                places: placesForDay,
                meals,
                accommodation,
                transportation: transportDetails,
                weatherForecast: weather,
                dayCost
            });
        }

        // Calculate total cost
        let totalCost = itineraryDays.reduce((sum, day) => sum + day.dayCost, 0);

        // Save itinerary to DB
        const itinerary = new Itinerary({
            destination,
            days,
            interests,
            budget,
            totalCost,
            userId: req.user.id,
            itinerary: itineraryDays
        });

        await itinerary.save();
        res.status(201).json(itinerary);
    } catch (error) {
        console.error("Error creating itinerary:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
