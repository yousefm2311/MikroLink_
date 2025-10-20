import express from "express";
import Trip from "../models/Trip.js";
import Rating from "../models/Rating.js";
import { protect } from "../Middleware/auth.js";

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

export default router;
