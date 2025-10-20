import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  title: { type: String, required: true },
  details: { type: String },
  dueDate: { type: Date },
  read: { type: Boolean, default: false },
});

export default mongoose.model("Reminder", reminderSchema);
