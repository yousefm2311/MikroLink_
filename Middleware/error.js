export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const notFound = (req, res, next) => {
  next(new ApiError(404, `المسار ${req.originalUrl} غير موجود`));
};

export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  const payload = {
    success: false,
    message: err.message || 'حدث خطأ غير متوقع',
  };

  if (err.details) payload.details = err.details;
  if (!isProd && err.stack) payload.stack = err.stack;

  // Fallback for unexpected errors
  if (!err.statusCode && status === 500) {
    payload.message = 'عطل داخلي في الخادم';
  }

  res.status(status).json(payload);
};

