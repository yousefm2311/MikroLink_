import express from "express";
import { protectUser as protect } from "../Middleware/auth.js";
import Favorite from "../models/User-Model/favorite.model.js";
import { ok, created } from "../utils/api-response.js";

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const list = await Favorite.find({ userId: req.user._id }).populate("driverId", "fullName phone vehicleType");
    return ok(res, "Favorites", list);
  } catch (err) { return next(err); }
});

router.post("/:driverId", protect, async (req, res, next) => {
  try {
    const fav = await Favorite.findOneAndUpdate(
      { userId: req.user._id, driverId: req.params.driverId },
      { userId: req.user._id, driverId: req.params.driverId },
      { new: true, upsert: true }
    );
    return created(res, "Added to favorites", fav);
  } catch (err) { return next(err); }
});

router.delete("/:driverId", protect, async (req, res, next) => {
  try {
    await Favorite.findOneAndDelete({ userId: req.user._id, driverId: req.params.driverId });
    return ok(res, "Removed from favorites");
  } catch (err) { return next(err); }
});

export default router;

