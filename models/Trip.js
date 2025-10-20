import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  passengerName: String,
  pickupLocation: String,
  dropoffLocation: String,
  fare: Number,
  distance: Number,
  status: {
    type: String,
    enum: ["pending", "accepted", "in_progress", "completed", "cancelled"],
    default: "pending",
  },
  startedAt: Date,
  completedAt: Date,
});

export default mongoose.model("Trip", tripSchema);
