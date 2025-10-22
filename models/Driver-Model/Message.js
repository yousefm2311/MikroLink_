import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Message", messageSchema);

