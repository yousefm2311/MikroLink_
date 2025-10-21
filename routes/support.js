import express from "express";
import Message from "../models/Message.js";
import { protect } from "../Middleware/auth.js";
import { supportCreateValidator } from "../Middleware/validators.js";
import { validationResult } from "express-validator";
import { ApiError } from "../Middleware/error.js";
import { ok, created } from "../utils/ApiResponse.js";
import { MESSAGES } from "../utils/messages.js";

const router = express.Router();

router.post("/", protect, supportCreateValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, errors.array());
    const msg = await Message.create({
      driverId: req.driver._id,
      sender: "driver",
      message: req.body.message,
    });
    return created(res, MESSAGES.support.sent, msg);
  } catch (err) {
    return next(err);
  }
});

router.get("/", protect, async (req, res, next) => {
  try {
    const msgs = await Message.find({ driverId: req.driver._id }).sort({ sentAt: 1 });
    return ok(res, MESSAGES.support.list, msgs);
  } catch (err) {
    return next(err);
  }
});

export default router;

