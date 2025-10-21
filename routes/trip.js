import express from "express";
import Trip from "../models/Trip.js";
import { protect } from "../Middleware/auth.js";
import { tripStartValidator } from "../Middleware/validators.js";
import { validationResult } from "express-validator";
import { ApiError } from "../Middleware/error.js";
import { ok, created } from "../utils/ApiResponse.js";
import { MESSAGES } from "../utils/messages.js";

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const trips = await Trip.find({ driverId: req.driver._id }).sort({ startedAt: -1 });
    return ok(res, MESSAGES.system.ok, trips);
  } catch (err) {
    return next(err);
  }
});

router.post("/start", protect, tripStartValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, errors.array());
    const { passengerName, pickupLocation, dropoffLocation, fare, distance } = req.body;
    const trip = await Trip.create({
      driverId: req.driver._id,
      passengerName,
      pickupLocation,
      dropoffLocation,
      fare,
      distance,
      status: "in_progress",
      startedAt: new Date(),
    });
    return created(res, MESSAGES.system.ok, trip);
  } catch (err) {
    return next(err);
  }
});

router.post("/:id/complete", protect, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) throw new ApiError(404, "الرحلة غير موجودة");
    trip.status = "completed";
    trip.completedAt = new Date();
    await trip.save();
    return ok(res, MESSAGES.system.ok, trip);
  } catch (err) {
    return next(err);
  }
});

router.get("/current", protect, async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ driverId: req.driver._id, status: "in_progress" });
    return ok(res, MESSAGES.system.ok, { trip: trip || null });
  } catch (err) {
    return next(err);
  }
});

router.post("/:id/cancel", protect, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) throw new ApiError(404, "الرحلة غير موجودة");
    trip.status = "cancelled";
    await trip.save();
    return ok(res, MESSAGES.system.ok, trip);
  } catch (err) {
    return next(err);
  }
});

router.get("/history", protect, async (req, res, next) => {
  try {
    const trips = await Trip.find({ driverId: req.driver._id, status: "completed" }).sort({ completedAt: -1 });
    return ok(res, MESSAGES.system.ok, trips);
  } catch (err) {
    return next(err);
  }
});

export default router;

