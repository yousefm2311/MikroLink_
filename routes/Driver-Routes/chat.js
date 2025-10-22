import express from "express";
import Message from "../../models/Driver-Model/Message.js";

const router = express.Router();

/* =======================================================
   ✅ 1. جلب كل الرسائل الخاصة برحلة معينة (Trip)
   ======================================================= */
router.get("/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;
    const messages = await Message.find({ tripId }).sort({ timestamp: 1 });
    res.json({ count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =======================================================
   ✅ 2. (اختياري) إرسال رسالة جديدة من الـ API (بدون Socket)
   ======================================================= */
router.post("/", async (req, res) => {
  try {
    const { tripId, senderId, receiverId, text } = req.body;
    if (!tripId || !senderId || !text)
      return res
        .status(400)
        .json({ message: "tripId, senderId, and text are required" });

    const newMsg = await Message.create({ tripId, senderId, receiverId, text });
    res.status(201).json(newMsg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
