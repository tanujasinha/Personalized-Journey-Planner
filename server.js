// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const session = require('express-session');

dotenv.config();
// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5000", credentials: true }));
// Serve static frontend files
app.use(express.static(path.join(__dirname, "frontend")));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));
// Serve frontend pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "pages", "index.html"));
});
app.get("/login(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "pages", "login.html"));
});
app.get("/signup(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "pages", "signup.html"));
});
app.get("/dashboard(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "pages", "dashboard.html"));
});
app.get("/itinerary(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "pages", "itinerary.html"));
});
app.get("/trip-planner(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "pages", "trip-planner.html"));
});
app.get("/profile(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "pages", "profile.html"));
});
app.get("/contact(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "pages", "contact.html"));
});
app.get("/transport-guidance(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "pages", "transport-guidance.html"));
});
app.get('/api/logout', (req, res) => {
  req.session.destroy();
  res.status(200).json({ message: 'Logged out successfully' });
});
// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/personalizedJourneyPlanner")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

//  User Schema
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
// Start Server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} - http://localhost:${PORT}`);
});

// Routes
app.post('/api/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const userId = uuidv4();
    const newUser = new User({
      userId,
      fullName,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      userId,
      fullName,
      email
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Store user in session
    req.session.user = {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email
    };

    res.status(200).json({
      message: 'Login successful',
      user: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/check-auth', (req, res) => {
  if (req.session.user) {
    res.status(200).json({ isAuthenticated: true, user: req.session.user });
  } else {
    res.status(200).json({ isAuthenticated: false });
  }
});

