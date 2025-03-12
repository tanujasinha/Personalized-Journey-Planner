//backend/models/Itinerary.js

const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema({
    destination: { type: String, required: true },
    days: { type: Number, required: true },
    interests: { type: [String], required: true },
    budget: { type: Number, required: true },
    totalCost: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    itinerary: [
        {
            day: { type: Number, required: true },
            date: { type: Date },
            places: [
                {
                    name: { type: String, required: true },
                    placeId: { type: String },
                    description: { type: String },
                    address: { type: String },
                    photos: [String],
                    rating: { type: Number },
                    types: [String],
                    lat: { type: Number },
                    lng: { type: Number },
                    visitDuration: { type: Number }, // in minutes
                    cost: { type: Number, default: 0 }
                  }
            ],
            activities: [
                {
                    name: { type: String, required: true },
                    description: { type: String },
                    duration: { type: Number }, // in minutes
                    cost: { type: Number, default: 0 }
                  }
            ],
            meals: [
                {
                  type: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
                  place: { type: String },
                  cost: { type: Number, default: 0 }
                }
              ],
              accommodation: {
                name: { type: String },
                address: { type: String },
                cost: { type: Number, default: 0 }
              },
              transportation: [
                {
                  type: { type: String },
                  from: { type: String },
                  to: { type: String },
                  cost: { type: Number, default: 0 },
                  duration: { type: Number } // in minutes
                }
              ],
              weatherForecast: {
                temperature: { type: Number },
                condition: { type: String },
                icon: { type: String }
              },
              dayCost: { type: Number, default: 0 }
        }
    ]
}, { timestamps: true });

const Itinerary = mongoose.model("Itinerary", itinerarySchema);

module.exports = Itinerary;
