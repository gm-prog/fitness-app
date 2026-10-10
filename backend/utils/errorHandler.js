class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleError = (err, _req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Something went wrong';

  // Wrong MongoDB ID error
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Wrong JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = `Json Web Token is invalid, Try again`;
    return res.status(400).json({
      success: false,
      message,
    });
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = `Json Web Token is expired, Try again`;
    return res.status(400).json({
      success: false,
      message,
    });
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

module.exports = {
  AppError,
  handleError,
};
