import express from "express";
import Fuel from "../models/Fuel.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

// 🔹 إضافة تعبئة جديدة
router.post("/", protect, async (req, res) => {
  const { liters, cost, odometer, stationName } = req.body;
  const fuel = await Fuel.create({
    driverId: req.driver._id,
    liters,
    cost,
    odometer,
    stationName
  });
  res.json({ message: "تم تسجيل التعبئة", fuel });
});

// 🔹 عرض سجل البنزين
router.get("/", protect, async (req, res) => {
  const fuelLogs = await Fuel.find({ driverId: req.driver._id }).sort({
    date: -1,
  });
  res.json(fuelLogs);
});

export default router;
