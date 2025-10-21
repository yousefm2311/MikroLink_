import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title: String,
  body: String,
  type: { type: String, enum: ["system", "admin"], default: "system" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", notificationSchema);

