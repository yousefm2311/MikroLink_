import express from "express";
import { validationResult } from "express-validator";
import { protect } from "../../Middleware/auth.js";
import { reminderCreateValidator } from "../../Middleware/validators.js";
import ApiError from "../../utils/ApiError.js";
import { created, ok } from "../../utils/api-response.js";
import { MESSAGES } from "../../utils/messages.js";
import Reminder from "./../../models/Driver-Model/reminder.model.js";

const router = express.Router();

router.post("/", protect, reminderCreateValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, errors.array());
    const { title, details, dueDate } = req.body;
    const reminder = await Reminder.create({
      driverId: req.driver._id,
      title,
      details,
      dueDate,
    });
    return created(res, MESSAGES.reminder.created, reminder);
  } catch (err) {
    return next(err);
  }
});

router.get("/", protect, async (req, res, next) => {
  try {
    const reminders = await Reminder.find({ driverId: req.driver._id }).sort({ dueDate: 1 });
    return ok(res, MESSAGES.reminder.list, reminders);
  } catch (err) {
    return next(err);
  }
});

router.put("/:id/read", protect, async (req, res, next) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) throw new ApiError(404, MESSAGES.reminder.not_found);
    reminder.read = true;
    await reminder.save();
    return ok(res, MESSAGES.reminder.marked_read, reminder);
  } catch (err) {
    return next(err);
  }
});

export default router;
