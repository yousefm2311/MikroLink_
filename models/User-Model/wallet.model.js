import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  balance: { type: Number, default: 0 },
  transactions: [
    {
      type: { type: String, enum: ["add", "pay"], required: true },
      amount: { type: Number, required: true },
      tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
      createdAt: { type: Date, default: Date.now },
      note: String,
    },
  ],
});

export default mongoose.model("Wallet", walletSchema);

