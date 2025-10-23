import express from "express";
import { protectUser as protect } from "../../Middleware/auth.js";
import Message from "../../models/Driver-Model/Message.js";

const router = express.Router();

router.get("/:tripId", protect, async (req, res) => {
  try {
    const { tripId } = req.params;
    const messages = await Message.find({ tripId }).sort({ timestamp: 1 });
    res.json({ count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

