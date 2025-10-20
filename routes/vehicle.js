import express from "express";
import Vehicle from "../models/Vehicle.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

// 🔹 الحصول على بيانات السيارة
router.get("/", protect, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ driverId: req.driver._id });
    if (!vehicle)
      return res.status(404).json({ message: "لم يتم تسجيل سيارة بعد" });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 إنشاء أو تحديث بيانات السيارة
router.post("/", protect, async (req, res) => {
  try {
    const { plateNumber, model, fuelLevel, odometer, nextOilChange } = req.body;

    let vehicle = await Vehicle.findOne({ driverId: req.driver._id });
    if (vehicle) {
      // تحديث
      vehicle.plateNumber = plateNumber || vehicle.plateNumber;
      vehicle.model = model || vehicle.model;
      vehicle.fuelLevel = fuelLevel || vehicle.fuelLevel;
      vehicle.odometer = odometer || vehicle.odometer;
      vehicle.nextOilChange = nextOilChange || vehicle.nextOilChange;
      await vehicle.save();
      return res.json({ message: "تم تحديث بيانات السيارة", vehicle });
    }

    // إنشاء جديدة
    vehicle = await Vehicle.create({
      driverId: req.driver._id,
      plateNumber,
      model,
      fuelLevel,
      odometer,
      nextOilChange,
    });

    res.status(201).json({ message: "تم إضافة السيارة بنجاح", vehicle });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
