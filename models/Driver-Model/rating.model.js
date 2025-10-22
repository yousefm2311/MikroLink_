import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  stars: { type: Number, min: 1, max: 5 },
  comment: String,
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Rating", ratingSchema);

