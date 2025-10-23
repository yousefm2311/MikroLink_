import express from "express";
import { protectAdmin } from "../../Middleware/auth.js";
import Driver from "../../models/Driver-Model/driver.model.js";
import User from "../../models/User-Model/user.model.js";
import Trip from "../../models/Driver-Model/trip.model.js";
import { ok } from "../../utils/api-response.js";

const router = express.Router();

router.get("/dashboard", protectAdmin(), async (req, res, next) => {
  try {
    const [drivers, users, trips] = await Promise.all([
      Driver.countDocuments(),
      User.countDocuments(),
      Trip.countDocuments(),
    ]);
    const earnings = await Trip.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$fare", 0] } } } }
    ]);
    return ok(res, "Overview", { drivers, users, trips, totalEarnings: earnings[0]?.total || 0 });
  } catch (err) { return next(err); }
});

router.get("/daily", protectAdmin(), async (req, res, next) => {
  try {
    const dayStart = new Date(); dayStart.setHours(0,0,0,0);
    const dayEnd = new Date();
    const trips = await Trip.find({ createdAt: { $gte: dayStart, $lte: dayEnd } });
    return ok(res, "Daily stats", { count: trips.length, earnings: trips.reduce((s,t)=> s + (t.fare||0), 0) });
  } catch (err) { return next(err); }
});

router.get("/monthly", protectAdmin(), async (req, res, next) => {
  try {
    const now = new Date(); const start = new Date(now.getFullYear(), now.getMonth(), 1); const end = new Date(now.getFullYear(), now.getMonth()+1, 1);
    const trips = await Trip.find({ createdAt: { $gte: start, $lt: end } });
    return ok(res, "Monthly stats", { count: trips.length, earnings: trips.reduce((s,t)=> s + (t.fare||0), 0) });
  } catch (err) { return next(err); }
});

router.get("/export", protectAdmin(), async (req, res, next) => {
  try {
    const items = await Trip.find({ status: 'completed' }).select('driverId userId fare completedAt');
    const lines = ["driverId,userId,fare,completedAt"].concat(items.map(i => `${i.driverId||''},${i.userId||''},${i.fare||0},${i.completedAt?.toISOString()||''}`));
    res.setHeader('Content-Type','text/csv'); res.setHeader('Content-Disposition','attachment; filename="reports.csv"');
    res.send(lines.join('\n'));
  } catch (err) { return next(err); }
});

export default router;

