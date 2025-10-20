import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  type: { type: String, required: true }, // زيت، كاوتش، فرامل
  date: { type: Date, required: true },
  odometer: { type: Number },
  cost: { type: Number },
  notes: { type: String },
});

export default mongoose.model("Maintenance", maintenanceSchema);
