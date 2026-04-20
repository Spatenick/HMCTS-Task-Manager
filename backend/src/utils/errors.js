/**
 * Base application error. All operational errors extend this so the
 * global error handler can distinguish them from programmer errors.
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 400);
    this.details = details;
  }
}

module.exports = { AppError, NotFoundError, ValidationError };
