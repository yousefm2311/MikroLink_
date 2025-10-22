import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    // When created by user it may not have driver yet
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: false,
    },
    // Link to User who requested the trip (optional for driver-initiated trips)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },

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
    paid: { type: Boolean, default: false },
    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Trip", tripSchema);
