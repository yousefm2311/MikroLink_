import express from "express";
import { protect } from "../Middleware/auth.js";
import Driver from "../models/Driver.js";
import DriverLocation from "../models/DriverLocation.js";
import TripLocation from "../models/TripLocation.js";
import { validationResult } from "express-validator";
import { liveLocationValidator, tripLocationCreateValidator } from "../Middleware/validators.js";
import { ok } from "../utils/ApiResponse.js";
import { ApiError } from "../Middleware/error.js";
import { MESSAGES } from "../utils/messages.js";

const router = express.Router();

router.post("/live", protect, liveLocationValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, errors.array());
    const { latitude, longitude } = req.body;
    const loc = await DriverLocation.findOneAndUpdate(
      { driverId: req.driver._id },
      { latitude, longitude, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    await Driver.findByIdAndUpdate(req.driver._id, { isOnline: true });
    return ok(res, MESSAGES.location.live_updated, { location: loc });
  } catch (err) {
    return next(err);
  }
});

router.get("/live", protect, async (req, res, next) => {
  try {
    const loc = await DriverLocation.findOne({ driverId: req.driver._id });
    if (!loc) return ok(res, MESSAGES.location.live_not_found, null);
    return ok(res, MESSAGES.location.live_updated, loc);
  } catch (err) {
    return next(err);
  }
});

router.get("/available", async (req, res, next) => {
  try {
    const userLat = Number(req.query.latitude);
    const userLon = Number(req.query.longitude);
    const filterVehicle = req.query.vehicleType;
    if (!Number.isFinite(userLat) || !Number.isFinite(userLon)) {
      throw new ApiError(400, MESSAGES.system.bad_request);
    }

    const drivers = await DriverLocation.find()
      .populate("driverId", "fullName phone vehicleType isOnline")
      .sort({ updatedAt: -1 });

    const onlineDrivers = drivers.filter((d) => d.driverId?.isOnline === true);

    const calcDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const averageSpeed = 35;
    let driversWithDistance = onlineDrivers.map((d) => {
      const distanceKm = calcDistance(userLat, userLon, d.latitude, d.longitude);
      const timeHours = distanceKm / averageSpeed;
      const etaMinutes = Math.ceil(timeHours * 60);
      return {
        driverId: d.driverId._id,
        name: d.driverId.fullName,
        phone: d.driverId.phone,
        vehicleType: d.driverId.vehicleType,
        latitude: d.latitude,
        longitude: d.longitude,
        distanceKm: +distanceKm.toFixed(2),
        etaMinutes,
        updatedAt: d.updatedAt,
      };
    });

    if (filterVehicle) {
      driversWithDistance = driversWithDistance.filter(
        (d) => d.vehicleType?.toLowerCase() === filterVehicle.toLowerCase()
      );
    }

    driversWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

    return ok(res, MESSAGES.location.available_result, {
      userLocation: { latitude: userLat, longitude: userLon },
      vehicleFilter: filterVehicle || null,
      count: driversWithDistance.length,
      drivers: driversWithDistance,
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/", protect, tripLocationCreateValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, errors.array());
    const { tripId, latitude, longitude } = req.body;
    const loc = await TripLocation.create({ tripId, driverId: req.driver._id, latitude, longitude });
    return ok(res, MESSAGES.location.trip_loc_created, loc);
  } catch (err) {
    return next(err);
  }
});

router.get("/:tripId", protect, async (req, res, next) => {
  try {
    const locations = await TripLocation.find({ tripId: req.params.tripId });
    return ok(res, MESSAGES.location.trip_locations, {
      tripId: req.params.tripId,
      count: locations.length,
      locations,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;

