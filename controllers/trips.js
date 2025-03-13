// controllers/trips.js
const Trip = require('../models/Trip');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all trips
// @route   GET /api/trips
// @access  Public
exports.getTrips = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  let query = Trip.find(JSON.parse(queryStr))
    .populate({
      path: 'destinations',
      select: 'name location photo'
    })
    .populate({
      path: 'user',
      select: 'name email'
    });

  // Public trips or user's own trips
  if (!req.user || req.user.role !== 'admin') {
    query = query.find({
      $or: [
        { isPublic: true },
        { user: req.user ? req.user.id : { $exists: false } }
      ]
    });
  }

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Trip.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const trips = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: trips.length,
    pagination,
    data: trips
  });
});

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Public
exports.getTrip = asyncHandler(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id)
    .populate({
      path: 'destinations',
      select: 'name location photo description'
    })
    .populate({
      path: 'activities',
      select: 'name description category photo location'
    })
    .populate({
      path: 'user',
      select: 'name email'
    });

  if (!trip) {
    return next(
      new ErrorResponse(`Trip not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is trip owner or trip is public
  if (!trip.isPublic && (!req.user || (trip.user.toString() !== req.user.id && req.user.role !== 'admin'))) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this trip`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: trip
  });
});

// @desc    Create new trip
// @route   POST /api/trips
// @access  Private
exports.createTrip = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const trip = await Trip.create(req.body);

  res.status(201).json({
    success: true,
    data: trip
  });
});

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
exports.updateTrip = asyncHandler(async (req, res, next) => {
  let trip = await Trip.findById(req.params.id);

  if (!trip) {
    return next(
      new ErrorResponse(`Trip not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is trip owner
  if (trip.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this trip`,
        401
      )
    );
  }

  trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: trip
  });
});

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
exports.deleteTrip = asyncHandler(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return next(
      new ErrorResponse(`Trip not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is trip owner
  if (trip.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this trip`,
        401
      )
    );
  }

  await trip.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});