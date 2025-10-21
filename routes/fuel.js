import express from "express";
import Fuel from "../models/fuel.model.js";
import { protect } from "../Middleware/auth.js";
import { fuelCreateValidator } from "../Middleware/validators.js";
import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";
import { ok, created } from "../utils/api-response.js";
import { MESSAGES } from "../utils/messages.js";

const router = express.Router();

router.post("/", protect, fuelCreateValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, errors.array());
    const { liters, cost, odometer, stationName } = req.body;
    const fuel = await Fuel.create({
      driverId: req.driver._id,
      liters,
      cost,
      odometer,
      stationName,
    });
    return created(res, MESSAGES.fuel.created, fuel);
  } catch (err) {
    return next(err);
  }
});

router.get("/", protect, async (req, res, next) => {
  try {
    const fuelLogs = await Fuel.find({ driverId: req.driver._id }).sort({ date: -1 });
    return ok(res, MESSAGES.fuel.list, fuelLogs);
  } catch (err) {
    return next(err);
  }
});

router.get("/summary", protect, async (req, res, next) => {
  try {
    const logs = await Fuel.find({ driverId: req.driver._id });
    const totalLiters = logs.reduce((s, r) => s + (r.liters || 0), 0);
    const totalCost = logs.reduce((s, r) => s + (r.cost || 0), 0);
    const averagePrice = totalLiters ? +(totalCost / totalLiters).toFixed(2) : 0;
    return ok(res, MESSAGES.fuel.summary, {
      totalLiters,
      totalCost,
      averagePrice,
      recordsCount: logs.length,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
