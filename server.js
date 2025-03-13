// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./backend/routes/authRoutes");
const transportRoutes = require("./backend/routes/transportRoutes");
const tripRoutes = require("./backend/routes/tripRoutes");
const weatherRoutes = require("./backend/routes/weatherRoutes");
const path = require("path");
const cookieParser = require("cookie-parser");
const { fetchPlaces } = require('./services/foursquareService');

dotenv.config();
// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5000", credentials: true }));
// Serve static frontend files
app.use(express.static(path.join(__dirname, "frontend")));
app.use(cookieParser());

// Make API keys available to the application
app.use((req, res, next) => {
  req.foursquareApiKey = process.env.FOURSQUARE_API_KEY;
  req.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  req.openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
  next();
});

// Serve frontend pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend","pages","index.html"));
});
app.get("/login(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend","pages","login.html"));
});
app.get("/signup(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend","pages","signup.html"));
});
app.get("/dashboard(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend","pages","dashboard.html"));
});
app.get("/itinerary(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend","pages","itinerary.html"));
});
app.get("/trip-planner(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend","pages","trip-planner.html"));
});
app.get("/profile(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend","pages","profile.html"));
});
app.get("/about(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend","pages","about.html"));
});
app.get("/transport-guidance(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "pages","transport-guidance.html"));
});

app.get('/places', async (req, res) => {
    const { query, near } = req.query;
    try {
        const places = await fetchPlaces(query, near);
        res.json(places);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch places' });
    }
});

// Routes
app.use(express.static("frontend")); // Serve static frontend files
app.use("/api/auth", authRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/trip", tripRoutes);
app.use("/api/weather", weatherRoutes);



// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}
    http://localhost:${PORT}`);
});


app.post('/api/generate-itinerary', async (req, res) => {
  try {
      const { destination, days, budget, interests } = req.body;

      if (!destination || !days || !budget) {
          return res.status(400).json({ error: 'All fields are required' });
      }

      // Example response (replace with actual itinerary logic)
      const itinerary = {
          destination,
          days,
          budget,
          recommendedPlaces: ["Place A", "Place B", "Place C"],
          transportOptions: ["Bus", "Train", "Flight"]
      };

      res.json({ success: true, itinerary });
  } catch (error) {
      console.error('Itinerary generation error:', error);
      res.status(500).json({ error: 'Server error' });
  }
});
