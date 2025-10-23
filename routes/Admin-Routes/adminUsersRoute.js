import express from "express";
import { protectAdmin } from "../../Middleware/auth.js";
import User from "../../models/User-Model/user.model.js";
import bcrypt from "bcryptjs";
import { ok } from "../../utils/api-response.js";
import ApiError from "../../utils/ApiError.js";

const router = express.Router();

router.get("/", protectAdmin(), async (req, res, next) => {
  try { const list = await User.find().sort({ createdAt: -1 }); return ok(res, "Users fetched", list); }
  catch (err) { return next(err); }
});

router.get("/:id", protectAdmin(), async (req, res, next) => {
  try { const u = await User.findById(req.params.id); if (!u) throw new ApiError(404, "User not found"); return ok(res, "User fetched", u); }
  catch (err) { return next(err); }
});

router.put("/:id/block", protectAdmin(), async (req, res, next) => {
  try { const u = await User.findById(req.params.id); if (!u) throw new ApiError(404, "User not found"); u.isActive = !u.isActive; await u.save(); return ok(res, u.isActive ? "Unblocked" : "Blocked", u); }
  catch (err) { return next(err); }
});

router.delete("/:id", protectAdmin("superadmin"), async (req, res, next) => {
  try { const u = await User.findById(req.params.id); if (!u) throw new ApiError(404, "User not found"); await u.deleteOne(); return ok(res, "User deleted"); }
  catch (err) { return next(err); }
});

router.put("/:id/reset-password", protectAdmin(), async (req, res, next) => {
  try { const { newPassword } = req.body; const u = await User.findById(req.params.id); if (!u) throw new ApiError(404, "User not found"); u.password = await bcrypt.hash(newPassword || '123456', 10); await u.save(); return ok(res, "Password reset", { id: u._id }); }
  catch (err) { return next(err); }
});

export default router;

