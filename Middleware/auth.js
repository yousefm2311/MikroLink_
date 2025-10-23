import jwt from "jsonwebtoken";
import Driver from "../models/Driver-Model/driver.model.js";
import User from "../models/User-Model/user.model.js";
import Admin from "../models/Admin-Model/admin.model.js";
import ApiError from "../utils/ApiError.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, 'Unauthorized: missing Bearer token');
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const base = (req.baseUrl || req.originalUrl || '').toString();
    const isUserRoute = base.startsWith('/api/user');

    if (isUserRoute) {
      const user = await User.findById(decoded.id).select("-password");
      if (!user) throw new ApiError(401, 'Unauthorized: user not found');
      if (user.isActive === false) throw new ApiError(403, 'Account is blocked');
      req.user = user;
      return next();
    }

    const driver = await Driver.findById(decoded.id).select("-password");
    if (!driver) throw new ApiError(401, 'Unauthorized: driver not found');
    if (driver.isActive === false) throw new ApiError(403, 'Account is blocked');
    req.driver = driver;
    return next();
  } catch (err) {
    return next(err);
  }
};

export const protectUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, 'Unauthorized: Bearer token is missing');
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) throw new ApiError(401, 'Unauthorized: user not found');
    if (req.user.isActive === false) throw new ApiError(403, 'Account is blocked');
    next();
  } catch (err) {
    return next(err);
  }
};

export const protectAdmin = (requiredRole = null) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, 'Unauthorized: Bearer token is missing');
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin || !admin.isActive) throw new ApiError(401, 'Unauthorized: admin not found or inactive');
    if (requiredRole && admin.role !== requiredRole) throw new ApiError(403, 'Forbidden: insufficient role');
    req.admin = admin;
    return next();
  } catch (err) {
    return next(err);
  }
};
