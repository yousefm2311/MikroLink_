import express from "express";
import { protectUser as protect } from "../Middleware/auth.js";
import UserNotification from "../models/User-Model/user-notification.model.js";
import { ok } from "../utils/api-response.js";
import ApiError from "../utils/ApiError.js";

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const list = await UserNotification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return ok(res, "Notifications", list);
  } catch (err) { return next(err); }
});

router.put("/:id/read", protect, async (req, res, next) => {
  try {
    const notif = await UserNotification.findOne({ _id: req.params.id, userId: req.user._id });
    if (!notif) throw new ApiError(404, "Notification not found");
    notif.read = true; await notif.save();
    return ok(res, "Marked read", notif);
  } catch (err) { return next(err); }
});

router.delete("/:id", protect, async (req, res, next) => {
  try {
    await UserNotification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    return ok(res, "Deleted");
  } catch (err) { return next(err); }
});

export default router;

