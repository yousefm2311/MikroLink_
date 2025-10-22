import mongoose from "mongoose";

const tripLocationSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  latitude: Number,
  longitude: Number,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("TripLocation", tripLocationSchema);

