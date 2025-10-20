import express from "express";
import Trip from "../models/Trip.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

// 🔹 حساب أرباح اليوم
router.get("/today", protect, async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const trips = await Trip.find({
    driverId: req.driver._id,
    status: "completed",
    completedAt: { $gte: today },
  });

  const total = trips.reduce((sum, trip) => sum + trip.fare, 0);
  res.json({ total, count: trips.length });
});

// 🔹 أرباح الشهر
router.get("/month", protect, async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const trips = await Trip.find({
    driverId: req.driver._id,
    status: "completed",
    completedAt: { $gte: startOfMonth },
  });

  const total = trips.reduce((sum, trip) => sum + trip.fare, 0);
  res.json({ total, count: trips.length });
});

export default router;
