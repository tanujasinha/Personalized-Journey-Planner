// controllers/attractions.js
const Attraction = require('../models/Attraction');
const Destination = require('../models/Destination');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all attractions
// @route   GET /api/attractions
// @route   GET /api/destinations/:destinationId/attractions
// @access  Public
exports.getAttractions = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.destinationId) {
    query = Attraction.find({ destination: req.params.destinationId });
  } else {
    query = Attraction.find().populate({
      path: 'destination',
      select: 'name location'
    });
  }

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
  query = query.find(JSON.parse(queryStr));

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
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const total = await Attraction.countDocuments(query);

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const attractions = await query;

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
    count: attractions.length,
    pagination,
    data: attractions
  });
});

// @desc    Get single attraction
// @route   GET /api/attractions/:id
// @access  Public
exports.getAttraction = asyncHandler(async (req, res, next) => {
  const attraction = await Attraction.findById(req.params.id).populate({
    path: 'destination',
    select: 'name description location'
  });

  if (!attraction) {
    return next(
      new ErrorResponse(`Attraction not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: attraction
  });
});

// @desc    Create new attraction
// @route   POST /api/destinations/:destinationId/attractions
// @access  Private
exports.createAttraction = asyncHandler(async (req, res, next) => {
    req.body.destination = req.params.destinationId;
    req.body.user = req.user.id;
  
    const destination = await Destination.findById(req.params.destinationId);
  
    if (!destination) {
      return next(
        new ErrorResponse(
          `Destination not found with id of ${req.params.destinationId}`,
          404
        )
      );
    }
  
    const attraction = await Attraction.create(req.body);
  
    res.status(201).json({
      success: true,
      data: attraction
    });
  });
  
  // @desc    Update attraction
  // @route   PUT /api/attractions/:id
  // @access  Private
  exports.updateAttraction = asyncHandler(async (req, res, next) => {
    let attraction = await Attraction.findById(req.params.id);
  
    if (!attraction) {
      return next(
        new ErrorResponse(`Attraction not found with id of ${req.params.id}`, 404)
      );
    }
  
    // Make sure user is admin
    if (req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this attraction`,
          401
        )
      );
    }
  
    attraction = await Attraction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
  
    res.status(200).json({
      success: true,
      data: attraction
    });
  });
  
  // @desc    Delete attraction
  // @route   DELETE /api/attractions/:id
  // @access  Private
  exports.deleteAttraction = asyncHandler(async (req, res, next) => {
    const attraction = await Attraction.findById(req.params.id);
  
    if (!attraction) {
      return next(
        new ErrorResponse(`Attraction not found with id of ${req.params.id}`, 404)
      );
    }
  
    // Make sure user is admin
    if (req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this attraction`,
          401
        )
      );
    }
  
    await attraction.remove();
  
    res.status(200).json({
      success: true,
      data: {}
    });
  });
  