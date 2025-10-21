import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

import Driver from "../models/driver.model.js";
import { protect } from "../Middleware/auth.js";
import ApiError from "../utils/ApiError.js";
import {
  signupValidator,
  loginValidator,
  resendVerificationValidator,
  forgotPasswordValidator,
  verifyResetCodeValidator,
  resetPasswordValidator,
  changePasswordValidator,
} from "../Middleware/validators.js";
import { MESSAGES } from "../utils/messages.js";
import { ok, created } from "../utils/api-response.js";
import { sendEmail } from "../utils/send-email.js";

const router = express.Router();

const sendVerificationEmail = async (email, token) => {
  const base = process.env.APP_URL || "http://localhost:5000";
  const url = `${base}/api/driver/verify/${token}`;
  const subject = MESSAGES.auth.verify_subject;
  const html = `
    <h3>${MESSAGES.auth.verify_heading}</h3>
    <p>يرجى تأكيد بريدك الإلكتروني بالضغط على الرابط التالي:</p>
    <p><a href="${url}">${url}</a></p>
  `;
  await sendEmail(email, subject, html);
};

router.post("/signup", signupValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, errors.array());

    const { fullName, phone, email, password } = req.body;

    const existing = await Driver.findOne({ email });
    if (existing) throw new ApiError(400, MESSAGES.auth.email_in_use);

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
    return created(res, MESSAGES.auth.signup_success);
  } catch (err) {
    return next(err);
  }
});

router.post("/resend-verification", resendVerificationValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, errors.array());
    const { email } = req.body;

    const driver = await Driver.findOne({ email });
    if (!driver) throw new ApiError(404, MESSAGES.profile.not_found);
    if (driver.verified) throw new ApiError(400, MESSAGES.auth.verify_done);

    const verifyToken = jwt.sign({ id: driver._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    await sendVerificationEmail(driver.email, verifyToken);
    return ok(res, MESSAGES.auth.verify_sent);
  } catch (err) {
    return next(err);
  }
});

router.get("/verify/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const driver = await Driver.findById(decoded.id);
    if (!driver) return res.status(404).send("<h2>المستخدم غير موجود</h2>");

    driver.verified = true;
    await driver.save();
    res.send("<h2>تم تأكيد البريد الإلكتروني بنجاح</h2>");
  } catch {
    res.status(400).send("<h2>رابط التحقق غير صالح أو منتهي</h2>");
  }
});

router.post("/login", loginValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, errors.array());
    const { email, password } = req.body;
    const driver = await Driver.findOne({ email });
    if (!driver) throw new ApiError(404, MESSAGES.profile.not_found);
    if (!driver.verified) throw new ApiError(403, MESSAGES.auth.login_unverified);

    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) throw new ApiError(400, MESSAGES.auth.login_invalid);

    const accessToken = jwt.sign({ id: driver._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(
      { id: driver._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    driver.refreshToken = refreshToken;
    await driver.save();

    return ok(res, MESSAGES.auth.login_success, { accessToken, refreshToken, driver });
  } catch (err) {
    return next(err);
  }
});

router.post("/forgot-password", forgotPasswordValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, errors.array());
    const { email } = req.body;

    const driver = await Driver.findOne({ email });
    if (!driver) throw new ApiError(404, MESSAGES.profile.not_found);

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    driver.resetCode = resetCode;
    driver.resetCodeExpires = expires;
    await driver.save();

    const subject = "رمز استعادة كلمة المرور";
    const html = `
      <h3>مرحباً ${driver.fullName || ""}</h3>
      <p>رمز استعادة كلمة المرور الخاص بك هو:</p>
      <h2 style="color:#007bff;">${resetCode}</h2>
      <p>الرمز صالح لمدة 10 دقائق.</p>
    `;
    await sendEmail(email, subject, html);

    return ok(res, MESSAGES.auth.forgot_sent);
  } catch (err) {
    return next(err);
  }
});

router.post("/verify-reset-code", verifyResetCodeValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, errors.array());
    const { email, code } = req.body;

    const driver = await Driver.findOne({ email });
    if (!driver) throw new ApiError(404, MESSAGES.profile.not_found);

    if (
      driver.resetCode !== code ||
      !driver.resetCodeExpires ||
      driver.resetCodeExpires < Date.now()
    ) {
      throw new ApiError(400, MESSAGES.auth.code_invalid);
    }

    return ok(res, MESSAGES.system.ok);
  } catch (err) {
    return next(err);
  }
});

router.post("/reset-password", resetPasswordValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, errors.array());
    const { email, code, newPassword } = req.body;

    const driver = await Driver.findOne({ email });
    if (!driver) throw new ApiError(404, MESSAGES.profile.not_found);

    if (
      driver.resetCode !== code ||
      !driver.resetCodeExpires ||
      driver.resetCodeExpires < Date.now()
    ) {
      throw new ApiError(400, MESSAGES.auth.code_invalid);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    driver.password = hashed;
    driver.resetCode = null;
    driver.resetCodeExpires = null;
    await driver.save();

    return ok(res, MESSAGES.auth.reset_success);
  } catch (err) {
    return next(err);
  }
});

router.post("/change-password", protect, changePasswordValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, errors.array());
    const { currentPassword, newPassword } = req.body;

    const driver = await Driver.findById(req.driver._id);
    if (!driver) throw new ApiError(404, MESSAGES.profile.not_found);

    const isMatch = await bcrypt.compare(currentPassword, driver.password);
    if (!isMatch) throw new ApiError(400, MESSAGES.auth.login_invalid);

    const hashed = await bcrypt.hash(newPassword, 10);
    driver.password = hashed;
    await driver.save();

    return ok(res, MESSAGES.auth.change_success);
  } catch (err) {
    return next(err);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new ApiError(401, MESSAGES.auth.refresh_missing);

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const driver = await Driver.findById(decoded.id);
    if (!driver) throw new ApiError(404, MESSAGES.profile.not_found);
    if (driver.refreshToken !== refreshToken) throw new ApiError(403, MESSAGES.auth.refresh_invalid);

    const newAccessToken = jwt.sign({ id: driver._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    return ok(res, MESSAGES.auth.refresh_success, { accessToken: newAccessToken });
  } catch (err) {
    return next(err);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const driver = await Driver.findById(decoded.id);
    if (!driver) throw new ApiError(404, MESSAGES.profile.not_found);

    driver.refreshToken = null;
    await driver.save();
    return ok(res, MESSAGES.auth.logout_success);
  } catch (err) {
    return next(err);
  }
});

export default router;
