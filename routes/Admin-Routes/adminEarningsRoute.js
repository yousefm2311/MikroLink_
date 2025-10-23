import express from "express";
import { protectAdmin } from "../../Middleware/auth.js";
import Trip from "../../models/Driver-Model/trip.model.js";
import { ok } from "../../utils/api-response.js";

const router = express.Router();

router.get("/", protectAdmin(), async (req, res, next) => {
  try {
    const total = await Trip.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$fare", 0] } } } }
    ]);
    return ok(res, "Earnings fetched", { total: total[0]?.total || 0 });
  } catch (err) { return next(err); }
});

router.get("/:driverId", protectAdmin(), async (req, res, next) => {
  try {
    const total = await Trip.aggregate([
      { $match: { status: "completed", driverId: req.params.driverId } },
      { $group: { _id: "$driverId", total: { $sum: { $ifNull: ["$fare", 0] } }, count: { $sum: 1 } } }
    ]);
    return ok(res, "Driver earnings", total[0] || { total:0, count:0 });
  } catch (err) { return next(err); }
});

router.post("/filter", protectAdmin(), async (req, res, next) => {
  try {
    const { from, to } = req.body; const match = { status: "completed" };
    if (from || to) { match.completedAt = {}; if (from) match.completedAt.$gte = new Date(from); if (to) match.completedAt.$lte = new Date(to); }
    const items = await Trip.find(match).sort({ completedAt: -1 });
    return ok(res, "Earnings filtered", items);
  } catch (err) { return next(err); }
});

router.get("/export/csv", protectAdmin(), async (req, res, next) => {
  try {
    const items = await Trip.find({ status: "completed" }).select("driverId userId fare completedAt");
    const lines = ["driverId,userId,fare,completedAt"].concat(items.map(i => `${i.driverId||''},${i.userId||''},${i.fare||0},${i.completedAt?.toISOString()||''}`));
    const csv = lines.join("\n");
    res.setHeader('Content-Type','text/csv'); res.setHeader('Content-Disposition','attachment; filename="earnings.csv"');
    return res.send(csv);
  } catch (err) { return next(err); }
});

export default router;

