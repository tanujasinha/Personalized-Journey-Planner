// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();
// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5000", credentials: true }));
// Serve static frontend files
app.use(express.static(path.join(__dirname, "frontend")));

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
app.get("/contact(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend","pages","contact.html"));
});
app.get("/transport-guidance(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "pages","transport-guidance.html"));
});

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/personalizedJourneyPlanner")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Start Server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} - http://localhost:${PORT}`);
});



