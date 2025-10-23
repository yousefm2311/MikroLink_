import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { protectAdmin } from "../../Middleware/auth.js";
import Admin from "../../models/Admin-Model/admin.model.js";
import { ok, created } from "../../utils/api-response.js";
import ApiError from "../../utils/ApiError.js";

const router = express.Router();

// One-time bootstrap to create the first superadmin securely
// Usage: set ADMIN_BOOTSTRAP_SECRET in .env and call this endpoint with header 'x-admin-bootstrap'
router.post("/bootstrap", async (req, res, next) => {
  try {
    const count = await Admin.countDocuments();
    if (count > 0) throw new ApiError(403, "Bootstrap disabled: admins already exist");

    const secret = req.headers["x-admin-bootstrap"] || req.headers["x-admin-bootstrap-secret"]; 
    if (!process.env.ADMIN_BOOTSTRAP_SECRET || secret !== process.env.ADMIN_BOOTSTRAP_SECRET) {
      throw new ApiError(401, "Unauthorized: invalid bootstrap secret");
    }

    const { fullName, email, password } = req.body || {};
    if (!fullName || !email || !password) throw new ApiError(400, "Missing fields");
    const exists = await Admin.findOne({ email });
    if (exists) throw new ApiError(400, "Admin email already exists");
    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ fullName, email, password: hashed, role: "superadmin" });
    return created(res, "Superadmin bootstrapped", admin);
  } catch (err) { return next(err); }
});

// Signup admin (superadmin only)
router.post("/signup", protectAdmin("superadmin"), async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password) throw new ApiError(400, "Missing fields");
    const exists = await Admin.findOne({ email });
    if (exists) throw new ApiError(400, "Admin email already exists");
    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ fullName, email, password: hashed, role: role === 'superadmin' ? 'superadmin' : 'admin' });
    return created(res, "Admin created", admin);
  } catch (err) { return next(err); }
});

// Login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) throw new ApiError(404, "Admin not found");
    const okPass = await bcrypt.compare(password, admin.password);
    if (!okPass) throw new ApiError(400, "Invalid credentials");
    const accessToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: admin._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "30d" });
    admin.refreshToken = refreshToken; await admin.save();
    return ok(res, "Admin logged in", { accessToken, refreshToken, admin });
  } catch (err) { return next(err); }
});

// List all admins (superadmin only)
router.get("/all", protectAdmin("superadmin"), async (req, res, next) => {
  try { const list = await Admin.find().sort({ createdAt: -1 }); return ok(res, "Admins fetched", list); }
  catch (err) { return next(err); }
});

// Change password
router.put("/change-password", protectAdmin(), async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin._id).select("+password");
    const okPass = await bcrypt.compare(currentPassword, admin.password);
    if (!okPass) throw new ApiError(400, "Current password incorrect");
    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();
    return ok(res, "Password changed");
  } catch (err) { return next(err); }
});

router.post("/logout", protectAdmin(), async (req, res, next) => {
  try { req.admin.refreshToken = null; await req.admin.save(); return ok(res, "Logged out"); }
  catch (err) { return next(err); }
});

export default router;
