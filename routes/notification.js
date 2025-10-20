import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const notis = await Notification.find().sort({ createdAt: -1 });
  res.json(notis);
});

export default router;
