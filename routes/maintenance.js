import express from "express";
import { protect } from "../Middleware/auth.js";
import Maintenance from "../models/Maintenance.js";

const router = express.Router();

// 🟢 إضافة صيانة جديدة
router.post("/", protect, async (req, res) => {
  try {
    const { type, date, odometer, cost, notes } = req.body;
    const record = await Maintenance.create({
      driverId: req.driver._id,
      type,
      date,
      odometer,
      cost,
      notes,
    });
    res.status(201).json({ message: "تم حفظ الصيانة بنجاح", record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔵 عرض سجل الصيانة
router.get("/", protect, async (req, res) => {
  try {
    const history = await Maintenance.find({ driverId: req.driver._id }).sort({
      date: -1,
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
