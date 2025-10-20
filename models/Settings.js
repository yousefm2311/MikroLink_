import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  language: { type: String, default: "ar" },
  darkMode: { type: Boolean, default: false },
  notifications: { type: Boolean, default: true },
});

export default mongoose.model("Settings", settingsSchema);
