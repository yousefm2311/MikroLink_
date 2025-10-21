import express from "express";
import Vehicle from "../models/vehicle.model.js";
import { protect } from "../Middleware/auth.js";
import { oilUpdateValidator } from "../Middleware/validators.js";
import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";
import { ok } from "../utils/api-response.js";
import { MESSAGES } from "../utils/messages.js";

const router = express.Router();

router.post("/update", protect, oilUpdateValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, errors.array());
    const { odometer, nextOilChange } = req.body;
    const vehicle = await Vehicle.findOne({ driverId: req.driver._id });
    if (!vehicle) throw new ApiError(404, MESSAGES.oil.vehicle_missing);

    vehicle.lastOilChangeDate = new Date();
    vehicle.odometer = odometer;
    vehicle.nextOilChange = nextOilChange;
    await vehicle.save();

    return ok(res, MESSAGES.oil.updated, vehicle);
  } catch (err) {
    return next(err);
  }
});

router.get("/", protect, async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ driverId: req.driver._id });
    if (!vehicle) throw new ApiError(404, MESSAGES.oil.vehicle_missing);

    const distanceSinceChange = vehicle.odometer - (vehicle.nextOilChange - 5000);
    const remaining = vehicle.nextOilChange - vehicle.odometer;

    return ok(res, MESSAGES.oil.fetched, {
      lastOilChangeDate: vehicle.lastOilChangeDate,
      odometer: vehicle.odometer,
      nextOilChange: vehicle.nextOilChange,
      distanceSinceChange,
      remaining,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
