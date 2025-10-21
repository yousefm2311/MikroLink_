import ApiError from "../utils/ApiError.js";

export const notFound = (req, res, next) => {
  next(new ApiError(404, 'Route not found'));
};

export const errorHandler = (err, req, res, next) => {
  const status = err instanceof ApiError ? err.statusCode : (err.status || 500);
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.error('[Error]', { status, message, stack: err.stack });
  }

  // Keep backward compatibility: always include message; add optional code/details
  res.status(status).json({
    message,
    ...(err.code ? { code: err.code } : {}),
    ...(err.details ? { details: err.details } : {}),
  });
};

