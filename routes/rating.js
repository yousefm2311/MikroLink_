import express from "express";
import Rating from "../models/rating.model.js";
import { protect } from "../Middleware/auth.js";
import { ok } from "../utils/api-response.js";
import { MESSAGES } from "../utils/messages.js";

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const ratings = await Rating.find({ driverId: req.driver._id }).sort({ date: -1 });
    const avg = ratings.length
      ? (ratings.reduce((a, b) => a + (b.stars || 0), 0) / ratings.length).toFixed(1)
      : 0;
    return ok(res, MESSAGES.rating.list, { average: avg, count: ratings.length, ratings });
  } catch (err) {
    return next(err);
  }
});

export default router;
