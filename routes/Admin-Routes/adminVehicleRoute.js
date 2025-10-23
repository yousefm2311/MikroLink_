import express from "express";
import mongoose from "mongoose";
import { protectAdmin } from "../../Middleware/auth.js";
import Vehicle from "../../models/Driver-Model/vehicle.model.js";
import { ok } from "../../utils/api-response.js";
import ApiError from "../../utils/ApiError.js";

const router = express.Router();

router.param("id", (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return next(new ApiError(400, "Invalid vehicle id"));
  }
  return next();
});

router.get("/", protectAdmin(), async (req, res, next) => {
  try { const list = await Vehicle.find().sort({ _id: -1 }); return ok(res, "Vehicles fetched", list); }
  catch (err) { return next(err); }
});

router.get("/:id", protectAdmin(), async (req, res, next) => {
  try { const v = await Vehicle.findById(req.params.id); if (!v) throw new ApiError(404, "Vehicle not found"); return ok(res, "Vehicle fetched", v); }
  catch (err) { return next(err); }
});

router.put("/:id/approve", protectAdmin(), async (req, res, next) => {
  try { const v = await Vehicle.findByIdAndUpdate(req.params.id, { approved: true }, { new: true }); if (!v) throw new ApiError(404, "Vehicle not found"); return ok(res, "Vehicle approved", v); }
  catch (err) { return next(err); }
});

export default router;
