// models/Attraction.js
const mongoose = require('mongoose');
const geocoder = require('../utils/geocoder');

const AttractionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an attraction name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    enum: [
      'landmark',
      'museum',
      'restaurant',
      'outdoor',
      'entertainment',
      'shopping',
      'accommodation',
      'other'
    ],
    required: [true, 'Please select a category']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String,
    city: String,
    state: String,
    zipcode: String,
    country: String
  },
  photo: {
    type: String,
    default: 'no-photo.jpg'
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  priceRange: {
    type: String,
    enum: ['free', 'low', 'medium', 'high', 'luxury'],
    default: 'medium'
  },
  openingHours: {
    type: String
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String
  },
  destination: {
    type: mongoose.Schema.ObjectId,
    ref: 'Destination',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Geocode & create location field
AttractionSchema.pre('save', async function(next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  };

  // Do not save address in DB
  this.address = undefined;
  next();
});

module.exports = mongoose.model('Attraction', AttractionSchema);
