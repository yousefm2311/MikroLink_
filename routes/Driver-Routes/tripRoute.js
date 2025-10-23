import express from "express";
import { validationResult } from "express-validator";
import { protect } from "../../Middleware/auth.js";
import { tripStartValidator } from "../../Middleware/validators.js";
import ApiError from "../../utils/ApiError.js";
import { created, ok } from "../../utils/api-response.js";
import { MESSAGES } from "../../utils/messages.js";
import Trip from "../../models/Driver-Model/trip.model.js";
import { getIO } from "../../socket.js";
import UserNotification from "../../models/User-Model/user-notification.model.js";

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

// List pending trips created by users (no driver assigned)
router.get("/pending", protect, async (req, res, next) => {
  try {
    const trips = await Trip.find({
      status: "pending",
      $or: [{ driverId: { $exists: false } }, { driverId: null }],
    }).sort({ createdAt: -1 });
    return ok(res, MESSAGES.system.ok, trips);
  } catch (err) {
    return next(err);
  }
});

// Accept a user-created trip (assign driver and set accepted)
router.post("/:id/accept", protect, async (req, res, next) => {
  try {
    if (!req.driver || !req.driver._id) {
      throw new ApiError(401, "Unauthorized: driver token required");
    }
    const trip = await Trip.findById(req.params.id);
    if (!trip) throw new ApiError(404, "Trip not found");
    if (trip.status !== "pending") throw new ApiError(400, "Trip is not pending");
    if (trip.driverId && String(trip.driverId) !== String(req.driver._id)) {
      throw new ApiError(403, "Trip already assigned to another driver");
    }
    trip.driverId = req.driver._id;
    trip.status = "accepted";
    await trip.save();
    try {
      if (trip.userId) {
        await UserNotification.create({ userId: trip.userId, title: "تم قبول الرحلة", body: "تم قبول طلب رحلتك من قبل سائق." });
      }
      getIO().to(`trip:${trip._id}`).emit("trip:accepted", { tripId: trip._id, driverId: req.driver._id });
    } catch {}
    return ok(res, MESSAGES.system.ok, trip);
  } catch (err) {
    return next(err);
  }
});

// Start an accepted trip
router.post("/:id/start", protect, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) throw new ApiError(404, "Trip not found");
    if (!trip.driverId || String(trip.driverId) !== String(req.driver._id)) {
      throw new ApiError(403, "Not your trip");
    }
    if (!["accepted", "in_progress"].includes(trip.status)) {
      throw new ApiError(400, "Trip must be accepted before start");
    }
    trip.status = "in_progress";
    if (!trip.startedAt) trip.startedAt = new Date();
    await trip.save();
    try {
      if (trip.userId) {
        await UserNotification.create({ userId: trip.userId, title: "بدأت الرحلة", body: "بدأت رحلتك الآن." });
      }
      getIO().to(`trip:${trip._id}`).emit("trip:started", { tripId: trip._id });
    } catch {}
    return ok(res, MESSAGES.system.ok, trip);
  } catch (err) {
    return next(err);
  }
});

router.post("/:id/complete", protect, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) throw new ApiError(404, "Trip not found");
    trip.status = "completed";
    trip.completedAt = new Date();
    await trip.save();
    try {
      if (trip.userId) {
        await UserNotification.create({ userId: trip.userId, title: "اكتملت الرحلة", body: "تم إنهاء رحلتك بنجاح." });
      }
      getIO().to(`trip:${trip._id}`).emit("trip:completed", { tripId: trip._id });
    } catch {}
    return ok(res, MESSAGES.system.ok, trip);
  } catch (err) {
    return next(err);
  }
});

router.get("/current", protect, async (req, res, next) => {
  try {
    const id = req.driver?._id || req.user?._id;
    if (!id) {
      return next(new ApiError(401, "Unauthorized: No driver or user found"));
    }
    const trip = await Trip.findOne({ driverId: id, status: "in_progress" });
    return ok(res, MESSAGES.system.ok, { trip: trip || null });
  } catch (err) {
    return next(err);
  }
});

router.post("/:id/cancel", protect, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) throw new ApiError(404, "Trip not found");
    trip.status = "cancelled";
    await trip.save();
    try {
      if (trip.userId) {
        await UserNotification.create({ userId: trip.userId, title: "تم إلغاء الرحلة", body: "قام السائق بإلغاء الرحلة." });
      }
      getIO().to(`trip:${trip._id}`).emit("trip:cancelled", { tripId: trip._id });
    } catch {}
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
