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

dotenv.config();
// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static("frontend")); // Serve static frontend files

// Make API keys available to the application
app.use((req, res, next) => {
  req.googlePlacesApiKey = process.env.GOOGLE_PLACES_API_KEY;
  req.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  req.openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
  next();
});

// Serve frontend pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});
app.get("/auth", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "auth.html"));
});
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dashboard.html"));
});
app.get("/itinerary", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "itinerary.html"));
});
app.get("/plan-trip", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "trip-planner.html"));
});
app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "profile.html"));
});
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "about.html"));
});
app.get("/transport-guidance", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "transport-guidance.html"));
});

// Routes
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
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});