import express from "express";
import Vehicle from "../models/Vehicle.js";
import { protect } from "../Middleware/auth.js";
import { vehicleUpsertValidator } from "../Middleware/validators.js";
import { validationResult } from "express-validator";
import { ApiError } from "../Middleware/error.js";
import { MESSAGES } from "../utils/messages.js";
import { ok } from "../utils/ApiResponse.js";

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ driverId: req.driver._id });
    if (!vehicle) throw new ApiError(404, MESSAGES.vehicle.not_found);
    return ok(res, MESSAGES.system.ok, vehicle);
  } catch (err) {
    return next(err);
  }
});

router.post("/", protect, vehicleUpsertValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, errors.array());
    const { plateNumber, model, fuelLevel, odometer, nextOilChange } = req.body;

    let vehicle = await Vehicle.findOne({ driverId: req.driver._id });
    if (vehicle) {
      vehicle.plateNumber = plateNumber || vehicle.plateNumber;
      vehicle.model = model || vehicle.model;
      vehicle.fuelLevel = fuelLevel || vehicle.fuelLevel;
      vehicle.odometer = odometer || vehicle.odometer;
      vehicle.nextOilChange = nextOilChange || vehicle.nextOilChange;
      await vehicle.save();
      return ok(res, MESSAGES.vehicle.upserted, vehicle);
    }

    vehicle = await Vehicle.create({
      driverId: req.driver._id,
      plateNumber,
      model,
      fuelLevel,
      odometer,
      nextOilChange,
    });

    return ok(res, MESSAGES.vehicle.upserted, vehicle);
  } catch (err) {
    return next(err);
  }
});

export default router;

