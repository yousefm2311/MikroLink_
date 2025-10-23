import express from "express";
import fs from "fs";
import multer from "multer";
import sharp from "sharp";
import { protectUser as protect } from "../../Middleware/auth.js";
import User from "../../models/User-Model/user.model.js";
import { ok } from "../../utils/api-response.js";
import ApiError from "../../utils/ApiError.js";
import { MESSAGES } from "../../utils/messages.js";

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
// Use disk storage (temp) to avoid memory pressure on large uploads
try { fs.mkdirSync("uploads/tmp", { recursive: true }); } catch {}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/tmp"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const fileFilter = (req, file, cb) => {
  if (/^image\//.test(file.mimetype)) return cb(null, true);
  cb(new ApiError(400, "Only image files are allowed"));
};
// Allow larger raw uploads; we will compress to smaller final files
// Increase file size limit to 100MB to reduce LIMIT_FILE_SIZE errors
const upload = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } });

router.post("/avatar", protect, upload.single("avatar"), async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, "avatar file is required");
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, MESSAGES.profile.not_found);
    // Ensure uploads folder exists
    try { fs.mkdirSync("uploads/avatars", { recursive: true }); } catch {}

    // Input is the temp file path saved by multer
    const inputPath = req.file.path;
    const ts = Date.now();
    const outPath = `uploads/avatars/${ts}-avatar.jpg`;

    // Compress and resize: auto-rotate, max width 1024, quality ~75
    await sharp(inputPath)
      .rotate()
      .resize({ width: 1024, withoutEnlargement: true })
      .jpeg({ quality: 75 })
      .toFile(outPath);

    // Remove temp file
    try { fs.unlinkSync(inputPath); } catch {}

    // Build a public URL for the stored file
    const base = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
    const publicUrl = `${base}/${outPath.replace(/\\/g, "/")}`;
    user.avatar = publicUrl;
    await user.save();
    return ok(res, "Avatar uploaded", { avatar: publicUrl });
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
