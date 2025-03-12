// backend/routes/weatherRoutes.js - New route for weather data
const express = require("express");
const router = express.Router();
const WeatherService = require("../services/weatherService");

// Get current weather for a location
router.get("/current/:location", async (req, res) => {
  try {
    const location = req.params.location;
    const weatherService = new WeatherService(req.openWeatherApiKey);
    const weatherData = await weatherService.getCurrentWeather(location);
    res.json(weatherData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get weather forecast for a location
router.get("/forecast/:location", async (req, res) => {
  try {
    const location = req.params.location;
    const days = req.query.days || 5;
    const weatherService = new WeatherService(req.openWeatherApiKey);
    const forecastData = await weatherService.getForecast(location, parseInt(days));
    res.json(forecastData);
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;