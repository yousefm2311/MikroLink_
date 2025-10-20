import express from "express";
import multer from "multer";
import Driver from "../models/Driver.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

// إعداد مكان حفظ الصور مؤقتًا
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// 🔹 عرض البيانات الشخصية
router.get("/", protect, async (req, res) => {
  const driver = await Driver.findById(req.driver._id).select("-password");
  res.json(driver);
});

// 🔹 تعديل البيانات الأساسية
router.put("/", protect, async (req, res) => {
  const { fullName, phone } = req.body;
  const driver = await Driver.findById(req.driver._id);
  if (!driver) return res.status(404).json({ message: "السائق غير موجود" });

  driver.fullName = fullName || driver.fullName;
  driver.phone = phone || driver.phone;
  await driver.save();
  res.json({ message: "تم تحديث البيانات", driver });
});

// 🔹 رفع المستندات
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
  async (req, res) => {
    const driver = await Driver.findById(req.driver._id);
    if (!driver) return res.status(404).json({ message: "السائق غير موجود" });

    if (req.files.idFront) driver.documents.idFront = req.files.idFront[0].path;
    if (req.files.idBack) driver.documents.idBack = req.files.idBack[0].path;
    if (req.files.license) driver.documents.license = req.files.license[0].path;
    if (req.files.carPhoto)
      driver.documents.carPhoto = req.files.carPhoto[0].path;
    if (req.files.profilePhoto)
      driver.documents.profilePhoto = req.files.profilePhoto[0].path;

    await driver.save();
    res.json({
      message: "تم رفع المستندات بنجاح",
      documents: driver.documents,
    });
  }
);

export default router;
