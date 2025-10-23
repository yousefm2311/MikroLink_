import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "superadmin"], default: "admin" },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true }
);

adminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export default mongoose.model("Admin", adminSchema);

