import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  verified: { type: Boolean, default: false },
  // Admin-level approval for documents/identity
  documentsVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  documents: {
    idFront: String,
    idBack: String,
    license: String,
    carPhoto: String,
    profilePhoto: String,
  },
  // unified verification flag -> use `verified` only
  verificationCode: String,
  isOnline: { type: Boolean, default: false },
  refreshToken: { type: String, default: null },
  resetCode: { type: String, default: null },
  resetCodeExpires: { type: Date, default: null },
});

export default mongoose.model("Driver", driverSchema);

