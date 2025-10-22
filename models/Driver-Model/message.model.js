import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  sender: { type: String, enum: ["driver", "admin"], required: true },
  message: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
});

export default mongoose.model("SupportMessage", messageSchema);
