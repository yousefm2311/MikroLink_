import express from "express";
import { protectUser as protect } from "../../Middleware/auth.js";
import AppRating from "../../models/User-Model/app-rating.model.js";
import { created } from "../../utils/api-response.js";
import ApiError from "../../utils/ApiError.js";

const router = express.Router();

router.post("/", protect, async (req, res, next) => {
  try {
    const { stars, comment } = req.body || {};
    const s = Number(stars);
    if (!Number.isFinite(s) || s < 1 || s > 5) throw new ApiError(400, "stars must be 1..5");
    const r = await AppRating.create({ userId: req.user._id, stars: s, comment });
    return created(res, "App rated", r);
  } catch (err) { return next(err); }
});

export default router;

