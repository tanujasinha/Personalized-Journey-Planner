const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema({
    destination: { type: String, required: true },
    days: { type: Number, required: true },
    interests: { type: [String], required: true },
    budget: { type: Number, required: true },
    itinerary: [
        {
            day: { type: Number, required: true },
            places: [String],
            activities: [String]
        }
    ]
}, { timestamps: true });

const Itinerary = mongoose.model("Itinerary", itinerarySchema);

module.exports = Itinerary;
