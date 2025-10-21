import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Driver from "../models/Driver.js";
import { protect } from "../Middleware/auth.js";
const router = express.Router();

/* =====================================================
   📧 دالة إرسال إيميل التفعيل
===================================================== */
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
    from: `"MikroLink" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "تفعيل حسابك في MikroLink",
    html: `
      <h3>مرحبًا بك في MikroLink 👋</h3>
      <p>اضغط على الرابط لتفعيل حسابك:</p>
      <a href="${url}">${url}</a>
    `,
  });
};

/* =====================================================
   🟢 التسجيل Sign Up
===================================================== */
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
      verified: false,
    });

    const verifyToken = jwt.sign({ id: driver._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    await sendVerificationEmail(email, verifyToken);
    res.status(201).json({
      message: "تم إنشاء الحساب، برجاء فحص الإيميل لتفعيله",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* =====================================================
   ✉️ إعادة إرسال إيميل التفعيل
===================================================== */
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "يرجى إدخال البريد الإلكتروني" });

    const driver = await Driver.findOne({ email });
    if (!driver) return res.status(404).json({ message: "الحساب غير موجود" });
    if (driver.verified)
      return res.status(400).json({ message: "✅ الحساب مفعل بالفعل" });

    // توليد توكن جديد للتفعيل
    const verifyToken = jwt.sign({ id: driver._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // إرسال إيميل جديد
    await sendVerificationEmail(driver.email, verifyToken);

    res.json({
      message: "📩 تم إرسال رابط تفعيل جديد إلى بريدك الإلكتروني",
    });
  } catch (err) {
    console.error("Resend Email Error:", err.message);
    res.status(500).json({ message: "حدث خطأ أثناء إرسال الإيميل" });
  }
});


/* =====================================================
   🔵 تفعيل الحساب عبر البريد
===================================================== */
router.get("/verify/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const driver = await Driver.findById(decoded.id);
    if (!driver) return res.status(404).send("<h2>❌ السائق غير موجود</h2>");

    driver.verified = true;
    await driver.save();
    res.send("<h2>✅ تم تفعيل الحساب بنجاح، يمكنك تسجيل الدخول الآن</h2>");
  } catch {
    res.status(400).send("<h2>❌ رابط التفعيل غير صالح أو منتهي</h2>");
  }
});

/* =====================================================
   🔐 تسجيل الدخول + توليد Access + Refresh Tokens
===================================================== */
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

    // إنشاء التوكنات
    const accessToken = jwt.sign({ id: driver._id }, process.env.JWT_SECRET, {
      expiresIn: "15m", // 15 دقيقة فقط
    });

    const refreshToken = jwt.sign(
      { id: driver._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" } // صالح 30 يوم
    );

    // تخزين refresh token في قاعدة البيانات
    driver.refreshToken = refreshToken;
    await driver.save();

    res.json({
      message: "تم تسجيل الدخول بنجاح",
      accessToken,
      refreshToken,
      driver,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "يرجى إدخال البريد الإلكتروني" });

    const driver = await Driver.findOne({ email });
    if (!driver) return res.status(404).json({ message: "الحساب غير موجود" });

    // توليد كود 6 أرقام
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // صالح لمدة 10 دقايق

    driver.resetCode = resetCode;
    driver.resetCodeExpires = expires;
    await driver.save();

    // إرسال الكود بالإيميل
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"MikroLink" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "إعادة تعيين كلمة المرور",
      html: `
        <h3>مرحبًا ${driver.fullName}</h3>
        <p>كود إعادة التعيين الخاص بك هو:</p>
        <h2 style="color:#007bff;">${resetCode}</h2>
        <p>صالح لمدة 10 دقائق فقط</p>
      `,
    });

    res.json({ message: "📩 تم إرسال كود إعادة التعيين إلى بريدك الإلكتروني" });
  } catch (err) {
    console.error("Forgot Password Error:", err.message);
    res.status(500).json({ message: "حدث خطأ أثناء إرسال الإيميل" });
  }
});



router.post("/verify-reset-code", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ message: "يرجى إدخال البريد والكود" });

    const driver = await Driver.findOne({ email });
    if (!driver) return res.status(404).json({ message: "الحساب غير موجود" });

    if (
      driver.resetCode !== code ||
      !driver.resetCodeExpires ||
      driver.resetCodeExpires < Date.now()
    ) {
      return res.status(400).json({ message: "❌ الكود غير صالح أو منتهي" });
    }

    res.json({ message: "✅ الكود صحيح، يمكنك الآن إدخال كلمة مرور جديدة" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const driver = await Driver.findOne({ email });
    if (!driver) return res.status(404).json({ message: "الحساب غير موجود" });

    // تحقق من الكود
    if (
      driver.resetCode !== code ||
      !driver.resetCodeExpires ||
      driver.resetCodeExpires < Date.now()
    ) {
      return res.status(400).json({ message: "❌ الكود غير صالح أو منتهي" });
    }

    // تشفير الباسورد الجديد
    const hashed = await bcrypt.hash(newPassword, 10);
    driver.password = hashed;

    // حذف الكود بعد الاستخدام
    driver.resetCode = null;
    driver.resetCodeExpires = null;
    await driver.save();

    res.json({ message: "✅ تم تحديث كلمة المرور بنجاح" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* =====================================================
   🔒 تغيير كلمة المرور (للسائق المسجّل)
===================================================== */
router.post("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // التحقق من إدخال البيانات
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "يرجى إدخال كلمة المرور الحالية والجديدة" });

    // البحث عن السائق من الـ token
    const driver = await Driver.findById(req.driver._id);
    if (!driver)
      return res.status(404).json({ message: "السائق غير موجود" });

    // مقارنة كلمة المرور القديمة
    const isMatch = await bcrypt.compare(currentPassword, driver.password);
    if (!isMatch)
      return res.status(400).json({ message: "❌ كلمة المرور الحالية غير صحيحة" });

    // تشفير الجديدة وتحديثها
    const hashed = await bcrypt.hash(newPassword, 10);
    driver.password = hashed;
    await driver.save();

    res.json({ message: "✅ تم تغيير كلمة المرور بنجاح" });
  } catch (err) {
    console.error("Change Password Error:", err.message);
    res.status(500).json({ message: "حدث خطأ أثناء تغيير كلمة المرور" });
  }
});


/* =====================================================
   ♻️ تجديد Access Token باستخدام Refresh Token
===================================================== */
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ message: "لا يوجد Refresh Token" });

    // تحقق من التوكن
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const driver = await Driver.findById(decoded.id);
    if (!driver) return res.status(404).json({ message: "السائق غير موجود" });
    if (driver.refreshToken !== refreshToken)
      return res.status(403).json({ message: "Refresh Token غير مطابق" });

    // إصدار Access جديد
    const newAccessToken = jwt.sign(
      { id: driver._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      message: "✅ تم إصدار Access Token جديد",
      accessToken: newAccessToken,
    });
  } catch (err) {
    res.status(403).json({ message: "Refresh Token غير صالح أو منتهي" });
  }
});

/* =====================================================
   🔴 تسجيل الخروج (حذف Refresh Token)
===================================================== */
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const driver = await Driver.findById(decoded.id);
    if (!driver) return res.status(404).json({ message: "السائق غير موجود" });

    driver.refreshToken = null;
    await driver.save();
    res.json({ message: "🚪 تم تسجيل الخروج بنجاح" });
  } catch (err) {
    res.status(400).json({ message: "حدث خطأ أثناء تسجيل الخروج" });
  }
});

export default router;
