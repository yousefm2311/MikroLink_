import express from "express";
import { protect } from "../../Middleware/auth.js";
import Fuel from "../../models/Driver-Model/fuel.model.js";
import { ok } from "../../utils/api-response.js";
import { MESSAGES } from "../../utils/messages.js";
import Rating from "../../models/Driver-Model/rating.model.js";
import Trip from "../../models/Driver-Model/trip.model.js";

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const driverId = req.driver._id;
    const totalTrips = await Trip.countDocuments({ driverId, status: "completed" });
    const earningsAgg = await Trip.aggregate([
      { $match: { driverId, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$fare" } } },
    ]);
    const ratings = await Rating.find({ driverId });
    const avgRating = ratings.length
      ? +(
          ratings.reduce((s, r) => s + (r.stars || 0), 0) / ratings.length
        ).toFixed(1)
      : 0;
    return ok(res, MESSAGES.summary.fetched, {
      totalTrips,
      totalEarnings: earningsAgg[0]?.total || 0,
      avgRating,
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/weekly", protect, async (req, res, next) => {
  try {
    const driverId = req.driver._id;
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    const trips = await Trip.find({
      driverId,
      status: "completed",
      completedAt: { $gte: weekAgo },
    });
    const totalTrips = trips.length;
    const totalEarnings = trips.reduce((s, t) => s + (t.fare || 0), 0);

    const ratings = await Rating.find({ driverId, date: { $gte: weekAgo } });
    const avgRating = ratings.length
      ? +(
          ratings.reduce((s, r) => s + (r.stars || 0), 0) / ratings.length
        ).toFixed(1)
      : 0;

    const fuels = await Fuel.find({ driverId, date: { $gte: weekAgo } });
    const totalFuel = fuels.reduce((s, f) => s + (f.liters || 0), 0);

    return ok(res, MESSAGES.summary.weekly, {
      totalTrips,
      totalEarnings,
      avgRating,
      totalFuel,
      from: weekAgo,
      to: now,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
