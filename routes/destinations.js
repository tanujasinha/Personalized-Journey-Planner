// routes/destinations.js
const express = require('express');
const {
  getDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination
} = require('../controllers/destinations');

// Include other resource routers
const attractionRouter = require('./attractions');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:destinationId/attractions', attractionRouter);

router
  .route('/')
  .get(getDestinations)
  .post(protect, authorize('admin'), createDestination);

router
  .route('/:id')
  .get(getDestination)
  .put(protect, authorize('admin'), updateDestination)
  .delete(protect, authorize('admin'), deleteDestination);

module.exports = router;