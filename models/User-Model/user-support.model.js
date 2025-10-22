import mongoose from "mongoose";

const userSupportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sender: { type: String, enum: ["user", "admin"], default: "user" },
  message: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
});

export default mongoose.model("UserSupportMessage", userSupportSchema);

