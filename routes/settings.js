import express from "express";
import Settings from "../models/Settings.js";
import { protect } from "../Middleware/auth.js";
import { settingsUpdateValidator } from "../Middleware/validators.js";
import { validationResult } from "express-validator";
import { ApiError } from "../Middleware/error.js";
import { ok } from "../utils/ApiResponse.js";
import { MESSAGES } from "../utils/messages.js";

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const existing = await Settings.findOne({ driverId: req.driver._id });
    const settings = existing || (await Settings.create({ driverId: req.driver._id }));
    return ok(res, MESSAGES.settings.fetched, settings);
  } catch (err) {
    return next(err);
  }
});

router.put("/", protect, settingsUpdateValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, errors.array());
    const { language, darkMode, notifications } = req.body;
    let settings = await Settings.findOne({ driverId: req.driver._id });
    if (!settings) settings = await Settings.create({ driverId: req.driver._id });

    if (language !== undefined) settings.language = language;
    if (darkMode !== undefined) settings.darkMode = darkMode;
    if (notifications !== undefined) settings.notifications = notifications;
    await settings.save();

    return ok(res, MESSAGES.settings.updated, settings);
  } catch (err) {
    return next(err);
  }
});

export default router;

