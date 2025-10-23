import express from "express";
import { protectUser as protect } from "../../Middleware/auth.js";
import UserSupportMessage from "../../models/User-Model/user-support.model.js";
import { created, ok } from "../../utils/api-response.js";

const router = express.Router();

router.post("/", protect, async (req, res, next) => {
  try {
    const { message } = req.body || {};
    const msg = await UserSupportMessage.create({ userId: req.user._id, sender: "user", message });
    return created(res, "Support message sent", msg);
  } catch (err) { return next(err); }
});

router.get("/", protect, async (req, res, next) => {
  try {
    const msgs = await UserSupportMessage.find({ userId: req.user._id }).sort({ sentAt: 1 });
    return ok(res, "Support messages", msgs);
  } catch (err) { return next(err); }
});

export default router;

