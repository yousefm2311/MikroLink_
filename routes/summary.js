import express from "express";
import Trip from "../models/Trip.js";
import Rating from "../models/Rating.js";
import { protect } from "../Middleware/auth.js";
import Fuel from "../models/Fuel.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const driverId = req.driver._id;
  const totalTrips = await Trip.countDocuments({
    driverId,
    status: "completed",
  });
  const earnings = await Trip.aggregate([
    { $match: { driverId, status: "completed" } },
    { $group: { _id: null, total: { $sum: "$fare" } } },
  ]);

  const ratings = await Rating.find({ driverId });
  const avgRating = ratings.length
    ? (ratings.reduce((a, b) => a + b.stars, 0) / ratings.length).toFixed(1)
    : 0;

  res.json({
    totalTrips,
    totalEarnings: earnings[0]?.total || 0,
    avgRating,
  });
});






// 🔹 إحصائيات أسبوعية
router.get("/weekly", protect, async (req, res) => {
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

  res.json({
    totalTrips,
    totalEarnings,
    avgRating,
    totalFuel,
    from: weekAgo,
    to: now,
  });
});

// (اختياري) ملخص عام (غير أسبوعي) لو احتجته سابقًا
router.get("/", protect, async (req, res) => {
  const driverId = req.driver._id;
  const totalTrips = await Trip.countDocuments({
    driverId,
    status: "completed",
  });
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

  res.json({
    totalTrips,
    totalEarnings: earningsAgg[0]?.total || 0,
    avgRating,
  });
});

export default router;
