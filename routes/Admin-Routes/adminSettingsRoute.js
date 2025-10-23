import express from "express";
import { protectAdmin } from "../../Middleware/auth.js";
import AppSettings from "../../models/System-Model/app-settings.model.js";
import { ok } from "../../utils/api-response.js";

const router = express.Router();

router.get("/", protectAdmin(), async (req, res, next) => {
  try { const s = await AppSettings.findOne() || await AppSettings.create({}); return ok(res, "Settings fetched", s); }
  catch (err) { return next(err); }
});

router.put("/", protectAdmin(), async (req, res, next) => {
  try { const s = await AppSettings.findOne() || await AppSettings.create({}); Object.assign(s, req.body || {}); await s.save(); return ok(res, "Settings updated", s); }
  catch (err) { return next(err); }
});

router.put("/zones", protectAdmin(), async (req, res, next) => {
  try { const s = await AppSettings.findOne() || await AppSettings.create({}); s.zones = Array.isArray(req.body?.zones) ? req.body.zones : s.zones; await s.save(); return ok(res, "Zones updated", s); }
  catch (err) { return next(err); }
});

export default router;

