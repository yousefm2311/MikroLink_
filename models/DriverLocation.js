import mongoose from "mongoose";

const driverLocationSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
    unique: true,
  },
  latitude: Number,
  longitude: Number,
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("DriverLocation", driverLocationSchema);
