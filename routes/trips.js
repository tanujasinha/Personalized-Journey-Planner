// routes/trips.js
const express = require('express');
const {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip
} = require('../controllers/trips');

const Trip = require('../models/Trip');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(getTrips)
  .post(protect, createTrip);

router
  .route('/:id')
  .get(getTrip)
  .put(protect, updateTrip)
  .delete(protect, deleteTrip);

module.exports = router;