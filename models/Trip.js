// models/Trip.js
const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a trip title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  destinations: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Destination',
    required: true
  }],
  activities: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Attraction'
  }],
  accommodation: {
    type: String,
    trim: true
  },
  transportationDetails: {
    type: String,
    trim: true
  },
  budget: {
    estimated: {
      type: Number,
      default: 0
    },
    actual: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  itinerary: [{
    day: Number,
    date: Date,
    activities: [{
      time: String,
      description: String,
      location: String,
      attraction: {
        type: mongoose.Schema.ObjectId,
        ref: 'Attraction'
      }
    }]
  }]
});

// Add a virtual property for trip duration
TripSchema.virtual('duration').get(function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Cascade delete itinerary items when a trip is deleted
TripSchema.pre('remove', async function(next) {
  await this.model('Itinerary').deleteMany({ trip: this._id });
  next();
});

module.exports = mongoose.model('Trip', TripSchema);