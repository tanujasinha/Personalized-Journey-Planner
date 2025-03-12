const express = require("express");
const router = express.Router();

// Example: Get transport options based on destination
router.get("/:destination", async (req, res) => {
    try {
        const destination = req.params.destination;
        
        // Mock transport data (replace this with API calls later)
        const transportOptions = [
            { mode: "Flight", price: 300, duration: "2h", provider: "Airline XYZ" },
            { mode: "Train", price: 100, duration: "5h", provider: "Express Train" },
            { mode: "Bus", price: 50, duration: "7h", provider: "City Bus Service" },
            { mode: "Taxi", price: 150, duration: "3h", provider: "Local Taxi" }
        ];

        res.json({ destination, transportOptions });
    } catch (error) {
        console.error("Error fetching transport data:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
