import express from "express";
import { protectAdmin } from "../../Middleware/auth.js";
import Trip from "../../models/Driver-Model/trip.model.js";
import Driver from "../../models/Driver-Model/driver.model.js";
import { ok } from "../../utils/api-response.js";
import ApiError from "../../utils/ApiError.js";

const router = express.Router();

router.get("/", protectAdmin(), async (req, res, next) => {
  try { const list = await Trip.find().sort({ createdAt: -1 }); return ok(res, "Trips fetched", list); }
  catch (err) { return next(err); }
});

router.get("/:id", protectAdmin(), async (req, res, next) => {
  try { const t = await Trip.findById(req.params.id).populate('driverId', 'fullName phone').populate('userId', 'fullName phone'); if (!t) throw new ApiError(404, "Trip not found"); return ok(res, "Trip fetched", t); }
  catch (err) { return next(err); }
});

router.put("/:id/cancel", protectAdmin(), async (req, res, next) => {
  try { const t = await Trip.findById(req.params.id); if (!t) throw new ApiError(404, "Trip not found"); t.status = 'cancelled'; await t.save(); return ok(res, "Trip cancelled", t); }
  catch (err) { return next(err); }
});

router.put("/:id/assign", protectAdmin(), async (req, res, next) => {
  try {
    const { driverId } = req.body; const t = await Trip.findById(req.params.id); if (!t) throw new ApiError(404, "Trip not found");
    const d = await Driver.findById(driverId); if (!d) throw new ApiError(404, "Driver not found");
    t.driverId = d._id; if (t.status === 'pending') t.status = 'accepted'; await t.save();
    return ok(res, "Driver assigned", t);
  } catch (err) { return next(err); }
});

router.post("/filter", protectAdmin(), async (req, res, next) => {
  try {
    const { from, to, status } = req.body; const q = {};
    if (status) q.status = status; if (from || to) q.createdAt = {}; if (from) q.createdAt.$gte = new Date(from); if (to) q.createdAt.$lte = new Date(to);
    const list = await Trip.find(q).sort({ createdAt: -1 }); return ok(res, "Trips filtered", list);
  } catch (err) { return next(err); }
});

export default router;

