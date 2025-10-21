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


// 🔹 ملخص استهلاك البنزين
router.get("/summary", protect, async (req, res) => {
  const logs = await Fuel.find({ driverId: req.driver._id });
  const totalLiters = logs.reduce((s, r) => s + (r.liters || 0), 0);
  const totalCost = logs.reduce((s, r) => s + (r.cost || 0), 0);
  const averagePrice = totalLiters ? +(totalCost / totalLiters).toFixed(2) : 0;
  res.json({
    totalLiters,
    totalCost,
    averagePrice,
    recordsCount: logs.length
  });
});


export default router;
