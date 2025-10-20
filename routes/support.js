import express from "express";
import Message from "../models/Message.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

// 🔹 إرسال رسالة
router.post("/", protect, async (req, res) => {
  const msg = await Message.create({
    driverId: req.driver._id,
    sender: "driver",
    message: req.body.message,
  });
  res.json({ message: "تم إرسال الرسالة", msg });
});

// 🔹 عرض كل الرسائل
router.get("/", protect, async (req, res) => {
  const msgs = await Message.find({ driverId: req.driver._id }).sort({
    sentAt: 1,
  });
  res.json(msgs);
});

export default router;
