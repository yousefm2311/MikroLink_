import express from "express";
import { protect } from "../../Middleware/auth.js";
import { ok } from "../../utils/api-response.js";
import { MESSAGES } from "../../utils/messages.js";
import Notification from "../../models/Driver-Model/notification.model.js";

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const notis = await Notification.find().sort({ createdAt: -1 });
    return ok(res, MESSAGES.notification.list, notis);
  } catch (err) {
    return next(err);
  }
});

export default router;
