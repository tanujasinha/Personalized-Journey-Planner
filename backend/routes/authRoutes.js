//backend/routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// REGISTER a new user
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = new User({ name, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// LOGIN user
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Set the token in HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Set to true in production
            maxAge: 3600000, // 1 hour
        });

        res.json({ message: "Login successful" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});
// LOGOUT user (Clears cookie)
router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
});

module.exports = router;
