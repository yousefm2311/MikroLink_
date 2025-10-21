import express from "express";
import Driver from "../models/Driver.js";
import { protect } from "../Middleware/auth.js";
import { ok } from "../utils/ApiResponse.js";
import { MESSAGES } from "../utils/messages.js";

const router = express.Router();

router.put("/toggle", protect, async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.driver._id);
    driver.isOnline = !driver.isOnline;
    await driver.save();
    const message = driver.isOnline ? MESSAGES.status.online : MESSAGES.status.offline;
    return ok(res, message, { isOnline: driver.isOnline });
  } catch (err) {
    return next(err);
  }
});

export default router;

