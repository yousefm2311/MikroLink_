import bcrypt from "bcryptjs";
import express from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";

import { protectUser as protect } from "../../Middleware/auth.js";
import {
  changePasswordValidator,
  forgotPasswordValidator,
  loginValidator,
  resendVerificationValidator,
  resetPasswordValidator,
  signupValidator,
  verifyResetCodeValidator,
} from "../../Middleware/validators.js";

import User from "../../models/User-Model/user.model.js";
import { created, ok } from "../../utils/api-response.js";
import ApiError from "../../utils/ApiError.js";
import { MESSAGES } from "../../utils/messages.js";
import { sendEmail } from "../../utils/send-email.js";

const router = express.Router();

const sendVerificationEmail = async (email, token) => {
  const base = process.env.APP_URL || "http://localhost:5000";
  const url = `${base}/api/user/verify/${token}`;
  const subject = MESSAGES.auth.verify_subject || "Verify your MikroLink account";
  const html = `
    <h3>MikroLink</h3>
    <p>Click the link below to verify your email:</p>
    <p><a href="${url}">${url}</a></p>
  `;
  await sendEmail(email, subject, html);
};

// Signup
router.post("/signup", signupValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, { details: errors.array() });

    const { fullName, phone, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(400, MESSAGES.auth.email_in_use);

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, phone, email, password: hashed, verified: false });

    const verifyToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    await sendVerificationEmail(email, verifyToken);

    return created(res, MESSAGES.auth.signup_success);
  } catch (err) {
    return next(err);
  }
});

// Resend verification
router.post("/resend-verification", resendVerificationValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, { details: errors.array() });

    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, MESSAGES.profile.not_found);
    if (user.verified) throw new ApiError(400, MESSAGES.auth.verify_done);

    const verifyToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    await sendVerificationEmail(user.email, verifyToken);

    return ok(res, MESSAGES.auth.verify_sent);
  } catch (err) {
    return next(err);
  }
});

// Verify by token (email link)
router.get("/verify/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).send("<h2>User not found</h2>");

    user.verified = true;
    await user.save();
    res.send("<h2>Email verified successfully</h2>");
  } catch {
    res.status(400).send("<h2>Invalid or expired verification link</h2>");
  }
});

// Login (Access + Refresh)
router.post("/login", loginValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, { details: errors.array() });

    const { email, phone, password } = req.body;
    const query = email ? { email } : phone ? { phone } : null;
    if (!query) throw new ApiError(400, MESSAGES.system.bad_request);

    const user = await User.findOne(query);
    if (!user) throw new ApiError(404, MESSAGES.profile.not_found);
    if (user.isActive === false) throw new ApiError(403, 'Account is blocked');
    if (!user.verified) throw new ApiError(403, MESSAGES.auth.login_unverified);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ApiError(400, MESSAGES.auth.login_invalid);

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "30d" });

    user.refreshToken = refreshToken;
    await user.save();

    return ok(res, MESSAGES.auth.login_success, { accessToken, refreshToken, user });
  } catch (err) {
    return next(err);
  }
});

// Forgot Password (OTP)
router.post("/forgot-password", forgotPasswordValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, { details: errors.array() });

    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, MESSAGES.profile.not_found);

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user.resetCode = resetCode;
    user.resetCodeExpires = expires;
    await user.save();

    const subject = (MESSAGES?.auth?.reset_subject) || "Password reset code";
    const html = `
      <h3>Hello ${user.fullName || ""}</h3>
      <p>Use the verification code below to reset your password:</p>
      <h2 style=\"color:#007bff;\">${resetCode}</h2>
      <p>This code expires in 10 minutes.</p>
    `;
    await sendEmail(email, subject, html);

    return ok(res, MESSAGES.auth.forgot_sent);
  } catch (err) {
    return next(err);
  }
});

// Verify Reset Code
router.post("/verify-reset-code", verifyResetCodeValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, { details: errors.array() });

    const { email, code } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, MESSAGES.profile.not_found);

    if (user.resetCode !== code || !user.resetCodeExpires || user.resetCodeExpires < Date.now()) {
      throw new ApiError(400, MESSAGES.auth.code_invalid);
    }
    return ok(res, MESSAGES.system.ok);
  } catch (err) {
    return next(err);
  }
});

// Reset Password
router.post("/reset-password", resetPasswordValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, errors.array());

    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, MESSAGES.profile.not_found);

    if (user.resetCode !== code || !user.resetCodeExpires || user.resetCodeExpires < Date.now()) {
      throw new ApiError(400, MESSAGES.auth.code_invalid);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetCode = null;
    user.resetCodeExpires = null;
    await user.save();

    return ok(res, MESSAGES.auth.reset_success);
  } catch (err) {
    return next(err);
  }
});

// Change Password (logged-in)
router.post("/change-password", protect, changePasswordValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, MESSAGES.system.bad_request, errors.array());

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, MESSAGES.profile.not_found);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new ApiError(400, MESSAGES.auth.login_invalid);

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return ok(res, MESSAGES.auth.change_success);
  } catch (err) {
    return next(err);
  }
});

// Refresh Access Token
router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new ApiError(401, MESSAGES.auth.refresh_missing);

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError(404, MESSAGES.profile.not_found);
    if (user.refreshToken !== refreshToken) throw new ApiError(403, MESSAGES.auth.refresh_invalid);

    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    return ok(res, MESSAGES.auth.refresh_success, { accessToken: newAccessToken });
  } catch (err) {
    return next(err);
  }
});

// Logout
router.post("/logout", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError(404, MESSAGES.profile.not_found);

    user.refreshToken = null;
    await user.save();
    return ok(res, MESSAGES.auth.logout_success);
  } catch (err) {
    return next(err);
  }
});

export default router;

// Aliases for /api/user/auth/* when mounted
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ message: 'token is required' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).send('<h2>User not found</h2>');
    user.verified = true;
    await user.save();
    return ok(res, MESSAGES.system.ok);
  } catch (e) {
    return res.status(400).json({ message: 'invalid token' });
  }
});

router.post('/resend', resendVerificationValidator, async (req, res, next) => {
  req.url = '/resend-verification';
  return router.handle(req, res, next);
});
router.post('/forgot', forgotPasswordValidator, async (req, res, next) => {
  req.url = '/forgot-password';
  return router.handle(req, res, next);
});
router.post('/verify-reset', verifyResetCodeValidator, async (req, res, next) => {
  req.url = '/verify-reset-code';
  return router.handle(req, res, next);
});
router.post('/reset', resetPasswordValidator, async (req, res, next) => {
  req.url = '/reset-password';
  return router.handle(req, res, next);
});
router.put('/change', protect, changePasswordValidator, async (req, res, next) => {
  req.method = 'POST';
  req.url = '/change-password';
  return router.handle(req, res, next);
});
