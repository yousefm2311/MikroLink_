export default class ApiError extends Error {
  constructor(statusCode, message, options = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode || 500;
    this.code = options.code || undefined;
    this.details = options.details || undefined;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

