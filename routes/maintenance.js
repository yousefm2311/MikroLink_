import express from "express";
import { protect } from "../Middleware/auth.js";
import Maintenance from "../models/maintenance.model.js";
import { maintenanceCreateValidator } from "../Middleware/validators.js";
import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";
import { ok, created } from "../utils/api-response.js";
import { MESSAGES } from "../utils/messages.js";

const router = express.Router();

router.post("/", protect, maintenanceCreateValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, errors.array());
    const { type, date, odometer, cost, notes } = req.body;
    const record = await Maintenance.create({
      driverId: req.driver._id,
      type,
      date,
      odometer,
      cost,
      notes,
    });
    return created(res, MESSAGES.maintenance.created, record);
  } catch (err) {
    return next(err);
  }
});

router.get("/", protect, async (req, res, next) => {
  try {
    const history = await Maintenance.find({ driverId: req.driver._id }).sort({ date: -1 });
    return ok(res, MESSAGES.maintenance.list, history);
  } catch (err) {
    return next(err);
  }
});

export default router;
