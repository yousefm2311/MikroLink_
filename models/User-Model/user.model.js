import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String },

    // حالة الحساب
    verified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // للجلسات
    refreshToken: { type: String, default: null },

    // لاسترجاع كلمة المرور
    resetCode: { type: String, default: null },
    resetCodeExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

// اختياري: حذف الباسوورد من الاستجابة
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

const User = mongoose.model("User", userSchema);
export default User;
