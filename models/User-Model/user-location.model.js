import mongoose from "mongoose";

const userLocationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  latitude: Number,
  longitude: Number,
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("UserLocation", userLocationSchema);

