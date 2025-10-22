import express from "express";
import { protectUser as protect } from "../Middleware/auth.js";
import Wallet from "../models/User-Model/wallet.model.js";
import Trip from "../models/Driver-Model/trip.model.js";
import { ok, created } from "../utils/api-response.js";
import ApiError from "../utils/ApiError.js";

const router = express.Router();

// Get wallet
router.get("/", protect, async (req, res, next) => {
  try {
    const wallet = (await Wallet.findOne({ userId: req.user._id })) || (await Wallet.create({ userId: req.user._id }));
    return ok(res, "Wallet", wallet);
  } catch (err) { return next(err); }
});

// Add balance
router.post("/add", protect, async (req, res, next) => {
  try {
    const { amount } = req.body || {};
    const val = Number(amount);
    if (!Number.isFinite(val) || val <= 0) throw new ApiError(400, "amount must be > 0");
    const wallet = (await Wallet.findOne({ userId: req.user._id })) || (await Wallet.create({ userId: req.user._id }));
    wallet.balance += val;
    wallet.transactions.push({ type: "add", amount: val, note: "Top up" });
    await wallet.save();
    return created(res, "Balance added", wallet);
  } catch (err) { return next(err); }
});

// Pay for trip
router.post("/pay/:tripId", protect, async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId, userId: req.user._id });
    if (!trip) throw new ApiError(404, "Trip not found");
    if (trip.paid) return ok(res, "Already paid", trip);
    const fare = Number(trip.fare || 0);
    const wallet = (await Wallet.findOne({ userId: req.user._id })) || (await Wallet.create({ userId: req.user._id }));
    if (wallet.balance < fare) throw new ApiError(400, "Insufficient balance");
    wallet.balance -= fare;
    wallet.transactions.push({ type: "pay", amount: fare, tripId: trip._id, note: "Trip payment" });
    trip.paid = true;
    await Promise.all([wallet.save(), trip.save()]);
    return ok(res, "Trip paid", { trip, wallet });
  } catch (err) { return next(err); }
});

export default router;

