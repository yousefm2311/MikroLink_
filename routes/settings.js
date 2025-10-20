import express from "express";
import Settings from "../models/Settings.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const settings =
    (await Settings.findOne({ driverId: req.driver._id })) ||
    (await Settings.create({ driverId: req.driver._id }));
  res.json(settings);
});

router.put("/", protect, async (req, res) => {
  const { language, darkMode, notifications } = req.body;
  let settings = await Settings.findOne({ driverId: req.driver._id });
  if (!settings) settings = await Settings.create({ driverId: req.driver._id });

  settings.language = language ?? settings.language;
  settings.darkMode = darkMode ?? settings.darkMode;
  settings.notifications = notifications ?? settings.notifications;
  await settings.save();

  res.json({ message: "تم حفظ الإعدادات", settings });
});

export default router;
