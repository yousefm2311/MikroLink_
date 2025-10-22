import express from "express";
import { protectUser as protect } from "../Middleware/auth.js";
import UserLocation from "../models/User-Model/user-location.model.js";
import DriverLocation from "../models/Driver-Model/driver-location.model.js";
import Trip from "../models/Driver-Model/trip.model.js";
import { ok } from "../utils/api-response.js";
import ApiError from "../utils/ApiError.js";

const router = express.Router();

// Update user live location
router.post("/", protect, async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body || {};
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      throw new ApiError(400, "latitude/longitude are required numbers");
    }
    const loc = await UserLocation.findOneAndUpdate(
      { userId: req.user._id },
      { latitude, longitude, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    return ok(res, "User location updated", loc);
  } catch (err) { return next(err); }
});

// Get driver live location for a trip
router.get("/:tripId", protect, async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId, userId: req.user._id });
    if (!trip || !trip.driverId) return ok(res, "Driver not assigned", null);
    const dloc = await DriverLocation.findOne({ driverId: trip.driverId });
    return ok(res, "Driver live location", dloc || null);
  } catch (err) { return next(err); }
});

export default router;

