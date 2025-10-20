import express from "express";
import Vehicle from "../models/Vehicle.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

// 🔹 تحديث آخر تغيير زيت
router.post("/update", protect, async (req, res) => {
  try {
    const { odometer, nextOilChange } = req.body;
    const vehicle = await Vehicle.findOne({ driverId: req.driver._id });
    if (!vehicle)
      return res.status(404).json({ message: "لم يتم العثور على السيارة" });

    vehicle.lastOilChangeDate = new Date();
    vehicle.odometer = odometer;
    vehicle.nextOilChange = nextOilChange;
    await vehicle.save();

    res.json({ message: "تم تحديث بيانات الزيت بنجاح", vehicle });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 عرض حالة الزيت
router.get("/", protect, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ driverId: req.driver._id });
    if (!vehicle)
      return res.status(404).json({ message: "لم يتم العثور على السيارة" });

    const distanceSinceChange =
      vehicle.odometer - (vehicle.nextOilChange - 5000);
    const remaining = vehicle.nextOilChange - vehicle.odometer;

    res.json({
      lastOilChangeDate: vehicle.lastOilChangeDate,
      odometer: vehicle.odometer,
      nextOilChange: vehicle.nextOilChange,
      distanceSinceChange,
      remaining,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
