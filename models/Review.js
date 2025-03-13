// models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for the review'],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'Please add some text']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please add a rating between 1 and 5']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  attraction: {
    type: mongoose.Schema.ObjectId,
    ref: 'Attraction',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

// Prevent user from submitting more than one review per attraction
ReviewSchema.index({ attraction: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function(attractionId) {
  const obj = await this.aggregate([
    {
      $match: { attraction: attractionId }
    },
    {
      $group: {
        _id: '$attraction',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    await this.model('Attraction').findByIdAndUpdate(attractionId, {
      averageRating: obj[0].averageRating.toFixed(1)
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.attraction);
});

// Call getAverageRating before remove
ReviewSchema.pre('remove', function() {
  this.constructor.getAverageRating(this.attraction);
});

module.exports = mongoose.model('Review', ReviewSchema);