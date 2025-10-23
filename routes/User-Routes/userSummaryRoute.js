import express from "express";
import { protectUser as protect } from "../../Middleware/auth.js";
import Rating from "../../models/Driver-Model/rating.model.js";
import Trip from "../../models/Driver-Model/trip.model.js";
import { ok } from "../../utils/api-response.js";

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const trips = await Trip.find({ userId });
    const completed = trips.filter(t => t.status === 'completed');
    const totalTrips = trips.length;
    const completedTrips = completed.length;
    const totalDistance = trips.reduce((s,t)=> s + (t.distance||0), 0);
    const totalFare = trips.reduce((s,t)=> s + (t.fare||0), 0);
    // ratings given by this user (by joining via tripId)
    const tripIds = completed.map(t=> t._id);
    const ratings = await Rating.find({ tripId: { $in: tripIds } });
    const avgDriverRatingGiven = ratings.length ? +(ratings.reduce((s,r)=> s + (r.stars||0),0)/ratings.length).toFixed(2) : 0;
    return ok(res, "User summary", { totalTrips, completedTrips, totalDistance, totalFare, avgDriverRatingGiven });
  } catch (err) { return next(err); }
});

export default router;

