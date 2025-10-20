import express from "express";
import Driver from "../models/Driver.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

router.put("/toggle", protect, async (req, res) => {
  const driver = await Driver.findById(req.driver._id);
  driver.isOnline = !driver.isOnline;
  await driver.save();
  res.json({
    message: driver.isOnline ? "أنت الآن متصل 🚗" : "تم إيقاف الحالة 🔴",
    isOnline: driver.isOnline,
  });
});

export default router;
