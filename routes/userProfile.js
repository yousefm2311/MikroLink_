import express from "express";
import multer from "multer";
import fs from "fs";
import User from "../models/User-Model/user.model.js";
import { protectUser as protect } from "../Middleware/auth.js";
import { ok } from "../utils/api-response.js";
import ApiError from "../utils/ApiError.js";
import { MESSAGES } from "../utils/messages.js";

const router = express.Router();

// 🟢 عرض الملف الشخصي
router.get("/", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) throw new ApiError(404, MESSAGES.profile.not_found);
    return ok(res, "تم جلب الملف الشخصي بنجاح", user);
  } catch (err) {
    return next(err);
  }
});

// ✏️ تحديث الملف الشخصي
router.put("/", protect, async (req, res, next) => {
  try {
    const { fullName, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, phone },
      { new: true }
    ).select("-password");
    if (!user) throw new ApiError(404, MESSAGES.profile.not_found);
    return ok(res, "تم تحديث الملف الشخصي بنجاح", user);
  } catch (err) {
    return next(err);
  }
});

// Upload avatar (single image)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const fileFilter = (req, file, cb) => {
  if (/^image\//.test(file.mimetype)) return cb(null, true);
  cb(new ApiError(400, "Only image files are allowed"));
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/avatar", protect, upload.single("avatar"), async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, "avatar file is required");
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, MESSAGES.profile.not_found);
    user.avatar = req.file.path;
    await user.save();
    return ok(res, "Avatar uploaded", { avatar: user.avatar });
  } catch (err) {
    return next(err);
  }
});

// Delete account
router.delete("/", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, MESSAGES.profile.not_found);
    if (user.avatar && fs.existsSync(user.avatar)) {
      try { fs.unlinkSync(user.avatar); } catch {}
    }
    await user.deleteOne();
    return ok(res, "Account deleted");
  } catch (err) {
    return next(err);
  }
});

export default router;
