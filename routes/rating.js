import express from "express";
import Rating from "../models/Rating.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

// 🔹 عرض تقييمات السائق
router.get("/", protect, async (req, res) => {
  const ratings = await Rating.find({ driverId: req.driver._id }).sort({
    date: -1,
  });
  const avg = ratings.length
    ? (ratings.reduce((a, b) => a + b.stars, 0) / ratings.length).toFixed(1)
    : 0;
  res.json({ average: avg, count: ratings.length, ratings });
});

export default router;
