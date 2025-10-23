import express from "express";
import { protectAdmin } from "../../Middleware/auth.js";
import DriverLocation from "../../models/Driver-Model/driver-location.model.js";
import Trip from "../../models/Driver-Model/trip.model.js";
import Driver from "../../models/Driver-Model/driver.model.js";
import { ok } from "../../utils/api-response.js";
import ApiError from "../../utils/ApiError.js";

const router = express.Router();

router.get("/drivers", protectAdmin(), async (req, res, next) => {
  try {
    const locs = await DriverLocation.find().populate('driverId', 'fullName phone isOnline');
    return ok(res, "Live drivers", locs);
  } catch (err) { return next(err); }
});

router.get("/trips", protectAdmin(), async (req, res, next) => {
  try { const trips = await Trip.find({ status: { $in: ["pending","accepted","in_progress"] } }); return ok(res, "Active trips", trips); }
  catch (err) { return next(err); }
});

router.get("/driver/:id", protectAdmin(), async (req, res, next) => {
  try { const d = await Driver.findById(req.params.id); if (!d) throw new ApiError(404, "Driver not found"); return ok(res, "Driver status", { id: d._id, isOnline: d.isOnline, documentsVerified: d.documentsVerified, isActive: d.isActive }); }
  catch (err) { return next(err); }
});

export default router;

