import express from "express";
import Reminder from "../models/Reminder.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

// 🟢 إضافة تنبيه جديد
router.post("/", protect, async (req, res) => {
  try {
    const { title, details, dueDate } = req.body;
    const reminder = await Reminder.create({
      driverId: req.driver._id,
      title,
      details,
      dueDate,
    });
    res.status(201).json({ message: "تم إنشاء التنبيه", reminder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔵 عرض التنبيهات
router.get("/", protect, async (req, res) => {
  try {
    const reminders = await Reminder.find({ driverId: req.driver._id }).sort({
      dueDate: 1,
    });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🟣 تحديد التنبيه كمقروء
router.put("/:id/read", protect, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder)
      return res.status(404).json({ message: "التنبيه غير موجود" });
    reminder.read = true;
    await reminder.save();
    res.json({ message: "تم تحديد التنبيه كمقروء", reminder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
