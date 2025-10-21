import express from "express";
import multer from "multer";
import Driver from "../models/driver.model.js";
import { protect } from "../Middleware/auth.js";
import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";
import { MESSAGES } from "../utils/messages.js";
import { ok } from "../utils/api-response.js";

const router = express.Router();

// Multer config with basic safety
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const fileFilter = (req, file, cb) => {
  if (/^image\//.test(file.mimetype)) return cb(null, true);
  cb(new ApiError(400, "Only image files are allowed"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.get("/", protect, async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.driver._id).select("-password");
    if (!driver) throw new ApiError(404, MESSAGES.profile.not_found);
    return ok(res, MESSAGES.profile.fetched, driver);
  } catch (err) {
    return next(err);
  }
});

router.put("/", protect, async (req, res, next) => {
  try {
    const { fullName, phone } = req.body;
    const driver = await Driver.findById(req.driver._id);
    if (!driver) throw new ApiError(404, MESSAGES.profile.not_found);

    driver.fullName = fullName || driver.fullName;
    driver.phone = phone || driver.phone;
    await driver.save();
    return ok(res, MESSAGES.profile.updated, driver);
  } catch (err) {
    return next(err);
  }
});

router.post(
  "/upload",
  protect,
  upload.fields([
    { name: "idFront" },
    { name: "idBack" },
    { name: "license" },
    { name: "carPhoto" },
    { name: "profilePhoto" },
  ]),
  async (req, res, next) => {
    try {
      const driver = await Driver.findById(req.driver._id);
      if (!driver) throw new ApiError(404, MESSAGES.profile.not_found);

      if (req.files?.idFront) driver.documents.idFront = req.files.idFront[0].path;
      if (req.files?.idBack) driver.documents.idBack = req.files.idBack[0].path;
      if (req.files?.license) driver.documents.license = req.files.license[0].path;
      if (req.files?.carPhoto) driver.documents.carPhoto = req.files.carPhoto[0].path;
      if (req.files?.profilePhoto) driver.documents.profilePhoto = req.files.profilePhoto[0].path;

      await driver.save();
      return ok(res, MESSAGES.profile.upload_success, { documents: driver.documents });
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
