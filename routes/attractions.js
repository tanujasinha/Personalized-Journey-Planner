// routes/attractions.js
const express = require('express');
const {
  getAttractions,
  getAttraction,
  createAttraction,
  updateAttraction,
  deleteAttraction
} = require('../controllers/attractions');

const Attraction = require('../models/Attraction');

// Include other resource routers
const reviewRouter = require('./reviews');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:attractionId/reviews', reviewRouter);

router
  .route('/')
  .get(getAttractions)
  .post(protect, authorize('admin'), createAttraction);

router
  .route('/:id')
  .get(getAttraction)
  .put(protect, authorize('admin'), updateAttraction)
  .delete(protect, authorize('admin'), deleteAttraction);

module.exports = router;
