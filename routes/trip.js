import express from "express";
import Trip from "../models/Trip.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

// 🔹 عرض الرحلات الحالية
router.get("/", protect, async (req, res) => {
  const trips = await Trip.find({ driverId: req.driver._id }).sort({
    startedAt: -1,
  });
  res.json(trips);
});

// 🔹 بدء رحلة
router.post("/start", protect, async (req, res) => {
  const { passengerName, pickupLocation, dropoffLocation, fare, distance } =
    req.body;
  const trip = await Trip.create({
    driverId: req.driver._id,
    passengerName,
    pickupLocation,
    dropoffLocation,
    fare,
    distance,
    status: "in_progress",
    startedAt: new Date(),
  });
  res.json({ message: "بدأت الرحلة", trip });
});

// 🔹 إنهاء الرحلة
router.post("/:id/complete", protect, async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) return res.status(404).json({ message: "الرحلة غير موجودة" });
  trip.status = "completed";
  trip.completedAt = new Date();
  await trip.save();
  res.json({ message: "تم إنهاء الرحلة", trip });
});
// 🔹 عرض الرحلة الحالية (لو في واحدة شغالة)
router.get("/current", protect, async (req, res) => {
  const trip = await Trip.findOne({
    driverId: req.driver._id,
    status: "in_progress"
  });

  if (!trip)
    return res.json({ message: "مفيش رحلة شغالة حالياً", trip: null });

  res.json({ message: "رحلة نشطة", trip });
});
// 🔹 إلغاء الرحلة
router.post("/:id/cancel", protect, async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) return res.status(404).json({ message: "الرحلة غير موجودة" });

  trip.status = "cancelled";
  await trip.save();

  res.json({ message: "تم إلغاء الرحلة", trip });
});

export default router;