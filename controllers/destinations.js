// controllers/destinations.js
const Destination = require('../models/Destination');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
exports.getDestinations = asyncHandler(async (req, res, next) => {
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
  let query = Destination.find(JSON.parse(queryStr));

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
  const total = await Destination.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const destinations = await query;

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
    count: destinations.length,
    pagination,
    data: destinations
  });
});

// @desc    Get single destination
// @route   GET /api/destinations/:id
// @access  Public
exports.getDestination = asyncHandler(async (req, res, next) => {
  const destination = await Destination.findById(req.params.id);

  if (!destination) {
    return next(
      new ErrorResponse(`Destination not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: destination
  });
});

// @desc    Create new destination
// @route   POST /api/destinations
// @access  Private/Admin
exports.createDestination = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Check for admin
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} is not authorized to create destinations`,
        401
      )
    );
  }

  const destination = await Destination.create(req.body);

  res.status(201).json({
    success: true,
    data: destination
  });
});

// @desc    Update destination
// @route   PUT /api/destinations/:id
// @access  Private/Admin
exports.updateDestination = asyncHandler(async (req, res, next) => {
  let destination = await Destination.findById(req.params.id);

  if (!destination) {
    return next(
      new ErrorResponse(`Destination not found with id of ${req.params.id}`, 404)
    );
  }

  // Check for admin
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} is not authorized to update destinations`,
        401
      )
    );
  }

  destination = await Destination.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: destination
  });
});

// @desc    Delete destination
// @route   DELETE /api/destinations/:id
// @access  Private/Admin
exports.deleteDestination = asyncHandler(async (req, res, next) => {
  const destination = await Destination.findById(req.params.id);

  if (!destination) {
    return next(
      new ErrorResponse(`Destination not found with id of ${req.params.id}`, 404)
    );
  }

  // Check for admin
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} is not authorized to delete destinations`,
        401
      )
    );
  }

  await destination.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
