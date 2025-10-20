import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Driver from "../models/Driver.js";

const router = express.Router();

// إرسال إيميل التفعيل
const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const url = `http://localhost:5000/api/driver/verify/${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "تفعيل حسابك في MikroLink",
    html: `<h3>مرحبًا بك في MikroLink 👋</h3>
           <p>اضغط على الرابط لتفعيل حسابك:</p>
           <a href="${url}">${url}</a>`,
  });
};

// 🟢 التسجيل
router.post("/signup", async (req, res) => {
  try {
    const { fullName, phone, email, password } = req.body;
    const existing = await Driver.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "الحساب موجود بالفعل" });

    const hashed = await bcrypt.hash(password, 10);
    const driver = await Driver.create({
      fullName,
      phone,
      email,
      password: hashed,
    });

    // إنشاء توكن للتفعيل
    const token = jwt.sign({ id: driver._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    await sendVerificationEmail(email, token);

    res
      .status(201)
      .json({ message: "تم إنشاء الحساب، برجاء فحص الإيميل للتفعيل" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔵 تفعيل الحساب
router.get("/verify/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const driver = await Driver.findById(decoded.id);
    if (!driver) return res.status(404).json({ message: "السائق غير موجود" });

    driver.verified = true;
    await driver.save();
    res.send("<h2>✅ تم تفعيل الحساب بنجاح، يمكنك تسجيل الدخول الآن</h2>");
  } catch {
    res.status(400).send("<h2>❌ رابط التفعيل غير صالح أو منتهي</h2>");
  }
});

// 🔐 تسجيل الدخول
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const driver = await Driver.findOne({ email });
    if (!driver) return res.status(404).json({ message: "الحساب غير موجود" });
    if (!driver.verified)
      return res.status(403).json({ message: "يرجى تفعيل الحساب أولًا" });

    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch)
      return res.status(400).json({ message: "كلمة المرور غير صحيحة" });

    const token = jwt.sign({ id: driver._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ message: "تم تسجيل الدخول بنجاح", token, driver });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
