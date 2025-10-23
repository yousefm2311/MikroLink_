import mongoose from "mongoose";

const appSettingsSchema = new mongoose.Schema({
  commission: { type: Number, default: 0.1 },
  workHours: { type: String, default: "24/7" },
  zones: { type: Array, default: [] },
}, { timestamps: true });

export default mongoose.model("AppSettings", appSettingsSchema);

