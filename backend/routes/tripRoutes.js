//backend/routes/tripRoutes.js

const express = require("express");
const router = express.Router();
const Itinerary = require("../models/Itinerary");

router.post("/plan", async (req, res) => {
    try {
        const { destination, days, interests, budget } = req.body;

        // Generate a simple itinerary
        const itineraryData = [];
        for (let i = 1; i <= days; i++) {
            itineraryData.push({
                day: i,
                places: ["Tourist Spot A", "Tourist Spot B", "Cultural Place C"],
                activities: ["Sightseeing", "Local Cuisine", "Museum Visit"]
            });
        }

        // Save itinerary to database
        const newItinerary = new Itinerary({
            destination,
            days,
            interests,
            budget,
            itinerary: itineraryData
        });

        await newItinerary.save();

        res.status(201).json(newItinerary);
    } catch (error) {
        console.error("Error generating itinerary:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get all saved itineraries
router.get("/", async (req, res) => {
    try {
        const itineraries = await Itinerary.find();
        res.json(itineraries);
    } catch (error) {
        console.error("Error fetching itineraries:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
