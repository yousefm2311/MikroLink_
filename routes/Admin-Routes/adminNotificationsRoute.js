import express from "express";
import { protectAdmin } from "../../Middleware/auth.js";
import Notification from "../../models/Driver-Model/notification.model.js";
import UserNotification from "../../models/User-Model/user-notification.model.js";
import { ok, created } from "../../utils/api-response.js";
import ApiError from "../../utils/ApiError.js";

const router = express.Router();

router.get("/", protectAdmin(), async (req, res, next) => {
  try { const list = await Notification.find().sort({ createdAt: -1 }); return ok(res, "Notifications fetched", list); }
  catch (err) { return next(err); }
});

router.post("/send", protectAdmin(), async (req, res, next) => {
  try {
    const { target, title, body, userId, driverId } = req.body; // target: 'all'|'users'|'drivers'|'user'|'driver'
    if (!title) throw new ApiError(400, "Title is required");
    if (target === 'user' && userId) {
      const doc = await UserNotification.create({ userId, title, body });
      return created(res, "Notification sent to user", doc);
    } else if (target === 'users') {
      // Broadcast to users is application-specific; here we just store a global notification
      const doc = await Notification.create({ title, body, type: 'system' });
      return created(res, "Users notification created", doc);
    } else if (target === 'driver' && driverId) {
      // For driver-specific, reuse Notification with type 'admin'
      const doc = await Notification.create({ title, body, type: 'admin' });
      return created(res, "Driver notification created", doc);
    } else {
      const doc = await Notification.create({ title, body, type: 'system' });
      return created(res, "Broadcast notification created", doc);
    }
  } catch (err) { return next(err); }
});

router.delete("/:id", protectAdmin(), async (req, res, next) => {
  try { const n = await Notification.findById(req.params.id); if (!n) throw new ApiError(404, "Notification not found"); await n.deleteOne(); return ok(res, "Notification deleted"); }
  catch (err) { return next(err); }
});

router.put("/:id", protectAdmin(), async (req, res, next) => {
  try { const n = await Notification.findByIdAndUpdate(req.params.id, { $set: req.body || {} }, { new: true }); if (!n) throw new ApiError(404, "Notification not found"); return ok(res, "Notification updated", n); }
  catch (err) { return next(err); }
});

export default router;

