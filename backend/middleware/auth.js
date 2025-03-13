//backend/middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    // Get token from the Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    // Check if token is missing
    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};
