const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Validation errors (Mongoose)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', ')
    });
  }

  // Cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource ID'
    });
  }

  // Handle errors with status code and message
  if (err.status && err.message) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
  }

  // Default to 500 server error
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

module.exports = errorHandler;