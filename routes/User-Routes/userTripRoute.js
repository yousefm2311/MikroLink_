import express from "express";
import { protectUser } from "../../Middleware/auth.js";
import Driver from "../../models/Driver-Model/driver.model.js";
import Rating from "../../models/Driver-Model/rating.model.js";
import Trip from "../../models/Driver-Model/trip.model.js";
import Wallet from "../../models/User-Model/wallet.model.js";
import { created, ok } from "../../utils/api-response.js";
import ApiError from "../../utils/ApiError.js";

const router = express.Router();

// Create a trip request by user
router.post("/request", protectUser, async (req, res, next) => {
  try {
    const { origin, destination, distance, price, preferredDriverId } = req.body;

    let driverId = null;
    if (preferredDriverId) {
      const driver = await Driver.findById(preferredDriverId);
      if (driver && driver.isOnline === true) {
        driverId = driver._id;
      }
    }

    const trip = await Trip.create({
      userId: req.user._id,
      driverId,
      passengerName: req.user.fullName,
      pickupLocation: origin,
      dropoffLocation: destination,
      distance,
      fare: price,
      status: "pending",
    });

    return created(res, "Trip requested", trip);
  } catch (err) {
    return next(err);
  }
});

// Alias: create trip at base
router.post("/", protectUser, async (req, res, next) => {
  try {
    const { origin, destination, distance, price, preferredDriverId } = req.body;
    let driverId = null;
    if (preferredDriverId) {
      const driver = await Driver.findById(preferredDriverId);
      if (driver && driver.isOnline === true) driverId = driver._id;
    }
    const trip = await Trip.create({
      userId: req.user._id,
      driverId,
      passengerName: req.user.fullName,
      pickupLocation: origin,
      dropoffLocation: destination,
      distance,
      fare: price,
      status: "pending",
    });
    return created(res, "Trip requested", trip);
  } catch (err) { return next(err); }
});

// List user's trips
router.get("/", protectUser, async (req, res, next) => {
  try {
    const trips = await Trip.find({ userId: req.user._id })
      .populate("driverId", "fullName phone vehicleType")
      .sort({ createdAt: -1 });
    return ok(res, "Trips fetched", trips);
  } catch (err) {
    return next(err);
  }
});

router.get("/active", protectUser, async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      userId: req.user._id,
      status: { $in: ["pending", "accepted", "in_progress"] },
    }).sort({ createdAt: -1 });
    return ok(res, "Current trip", trip || null);
  } catch (err) {
    return next(err);
  }
});

router.get("/current", protectUser, async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      userId: req.user._id,
      status: { $in: ["pending", "accepted", "in_progress"] },
    }).sort({ createdAt: -1 });
    return ok(res, "Current trip", trip || null);
  } catch (err) {
    return next(err);
  }
});

// User trip history (completed only)
router.get("/history", protectUser, async (req, res, next) => {
  try {
    const trips = await Trip.find({
      userId: req.user._id,
      status: "completed",
    }).sort({ completedAt: -1 });
    return ok(res, "Trip history", trips);
  } catch (err) {
    return next(err);
  }
});
// Get a single trip
router.get("/:id", protectUser, async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id })
      .populate("driverId", "fullName phone vehicleType");
    if (!trip) throw new ApiError(404, "Trip not found");
    return ok(res, "Trip fetched", trip);
  } catch (err) {
    return next(err);
  }
});

// Cancel a trip (pending/accepted only)
router.put("/:id/cancel", protectUser, async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) throw new ApiError(404, "Trip not found");
    if (!["pending", "accepted"].includes(trip.status)) {
      throw new ApiError(400, "Only pending or accepted trips can be cancelled");
    }
    trip.status = "cancelled";
    await trip.save();
    return ok(res, "Trip cancelled", trip);
  } catch (err) {
    return next(err);
  }
});

// Rate a completed trip (creates Rating doc linked to driver)
router.post("/:id/rate", protectUser, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) throw new ApiError(404, "Trip not found");
    if (trip.status !== "completed") {
      throw new ApiError(400, "Trip must be completed before rating");
    }
    if (!trip.driverId) {
      throw new ApiError(400, "Trip has no driver to rate");
    }
    const stars = Number(rating);
    if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
      throw new ApiError(400, "rating must be a number between 1 and 5");
    }
    const ratingDoc = await Rating.create({
      driverId: trip.driverId,
      tripId: trip._id,
      stars,
      comment,
    });
    return ok(res, "Rating submitted", ratingDoc);
  } catch (err) {
    return next(err);
  }
});

// Active trip alias


// Pay for trip via wallet
router.post("/:id/pay", protectUser, async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) throw new ApiError(404, "Trip not found");
    if (trip.paid) return ok(res, "Already paid", trip);
    const fare = Number(trip.fare || 0);
    const wallet = (await Wallet.findOne({ userId: req.user._id })) || (await Wallet.create({ userId: req.user._id }));
    if (wallet.balance < fare) throw new ApiError(400, "Insufficient balance");
    wallet.balance -= fare;
    wallet.transactions.push({ type: "pay", amount: fare, tripId: trip._id, note: "Trip payment" });
    trip.paid = true;
    await Promise.all([wallet.save(), trip.save()]);
    return ok(res, "Trip paid", { trip, wallet });
  } catch (err) { return next(err); }
});

// Get user's current active trip (pending/accepted/in_progress)


export default router;
