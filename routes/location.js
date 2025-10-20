import express from "express";
import TripLocation from "../models/TripLocation.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

// 🔹 حفظ نقطة موقع جديدة
router.post("/", protect, async (req, res) => {
  const { tripId, latitude, longitude } = req.body;
  const loc = await TripLocation.create({
    tripId,
    driverId: req.driver._id,
    latitude,
    longitude,
  });
  res.json({ message: "تم حفظ الموقع", loc });
});

// 🔹 عرض كل النقاط لرحلة معينة
router.get("/:tripId", protect, async (req, res) => {
  const locations = await TripLocation.find({ tripId: req.params.tripId });
  res.json({ count: locations.length, locations });
});

export default router;
