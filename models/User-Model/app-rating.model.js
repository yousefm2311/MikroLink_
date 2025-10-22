import mongoose from "mongoose";

const appRatingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stars: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("AppRating", appRatingSchema);

