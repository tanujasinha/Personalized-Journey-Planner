// backend/routes/transportRoutes.js - Updated transport routes
const express = require("express");
const router = express.Router();
const TransportService = require("../services/transportService");

// Get transport options based on origin and destination
router.get("/options", async (req, res) => {
  try {
    const { origin, destination } = req.query;
    
    if (!origin || !destination) {
      return res.status(400).json({ message: "Origin and destination are required" });
    }
    
    const transportService = new TransportService();
    const transportOptions = await transportService.getTransportOptions(origin, destination);
    
    res.json({ origin, destination, transportOptions });
  } catch (error) {
    console.error("Error fetching transport data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;