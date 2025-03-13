// models/Destination.js
const mongoose = require('mongoose');
const geocoder = require('../utils/geocoder');

const DestinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a destination name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
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
  bestTimeToVisit: {
    type: String,
    trim: true
  },
  averageCostPerDay: {
    type: Number
  },
  currency: {
    type: String,
    default: 'USD'
  },
  travelTips: [String],
  weatherInfo: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Geocode & create location field
DestinationSchema.pre('save', async function(next) {
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

module.exports = mongoose.model('Destination', DestinationSchema);