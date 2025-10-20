import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  documents: {
    idFront: String,
    idBack: String,
    license: String,
    carPhoto: String,
    profilePhoto: String,
  },
  isOnline: { type: Boolean, default: false }
});

export default mongoose.model("Driver", driverSchema);
