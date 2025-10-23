import express from "express";
import mongoose from "mongoose";
import { protectAdmin } from "../../Middleware/auth.js";
import Driver from "../../models/Driver-Model/driver.model.js";
import Vehicle from "../../models/Driver-Model/vehicle.model.js";
import { ok } from "../../utils/api-response.js";
import ApiError from "../../utils/ApiError.js";

const router = express.Router();

// Validate :id params to avoid CastError
router.param("id", (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return next(new ApiError(400, "Invalid driver id"));
  }
  return next();
});

router.get("/", protectAdmin(), async (req, res, next) => {
  try { const list = await Driver.find().sort({ createdAt: -1 }); return ok(res, "Drivers fetched", list); }
  catch (err) { return next(err); }
});

router.get("/:id", protectAdmin(), async (req, res, next) => {
  try { const d = await Driver.findById(req.params.id); if (!d) throw new ApiError(404, "Driver not found"); return ok(res, "Driver fetched", d); }
  catch (err) { return next(err); }
});

router.put("/:id/approve", protectAdmin(), async (req, res, next) => {
  try { const d = await Driver.findByIdAndUpdate(req.params.id, { documentsVerified: true }, { new: true }); if (!d) throw new ApiError(404, "Driver not found"); return ok(res, "Driver approved", d); }
  catch (err) { return next(err); }
});

router.put("/:id/reject", protectAdmin(), async (req, res, next) => {
  try { const d = await Driver.findByIdAndUpdate(req.params.id, { documentsVerified: false }, { new: true }); if (!d) throw new ApiError(404, "Driver not found"); return ok(res, "Driver rejected", d); }
  catch (err) { return next(err); }
});

router.put("/:id/block", protectAdmin(), async (req, res, next) => {
  try { const d = await Driver.findById(req.params.id); if (!d) throw new ApiError(404, "Driver not found"); d.isActive = !d.isActive; await d.save(); return ok(res, d.isActive ? "Unblocked" : "Blocked", d); }
  catch (err) { return next(err); }
});

router.delete("/:id", protectAdmin("superadmin"), async (req, res, next) => {
  try { const d = await Driver.findById(req.params.id); if (!d) throw new ApiError(404, "Driver not found"); await d.deleteOne(); return ok(res, "Driver deleted"); }
  catch (err) { return next(err); }
});

// Vehicle approval
router.get("/:id/vehicle", protectAdmin(), async (req, res, next) => {
  try { const v = await Vehicle.findOne({ driverId: req.params.id }); if (!v) throw new ApiError(404, "Vehicle not found"); return ok(res, "Vehicle fetched", v); }
  catch (err) { return next(err); }
});

router.put("/:id/vehicle/approve", protectAdmin(), async (req, res, next) => {
  try { const v = await Vehicle.findOneAndUpdate({ driverId: req.params.id }, { approved: true }, { new: true }); if (!v) throw new ApiError(404, "Vehicle not found"); return ok(res, "Vehicle approved", v); }
  catch (err) { return next(err); }
});

router.put("/:id/vehicle/reject", protectAdmin(), async (req, res, next) => {
  try { const v = await Vehicle.findOneAndUpdate({ driverId: req.params.id }, { approved: false }, { new: true }); if (!v) throw new ApiError(404, "Vehicle not found"); return ok(res, "Vehicle rejected", v); }
  catch (err) { return next(err); }
});

export default router;
