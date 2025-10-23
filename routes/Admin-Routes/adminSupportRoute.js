import express from "express";
import { protectAdmin } from "../../Middleware/auth.js";
import UserSupportMessage from "../../models/User-Model/user-support.model.js";
import SupportMessage from "../../models/Driver-Model/message.model.js";
import { ok } from "../../utils/api-response.js";
import ApiError from "../../utils/ApiError.js";

const router = express.Router();

router.get("/", protectAdmin(), async (req, res, next) => {
  try {
    const [users, drivers] = await Promise.all([
      UserSupportMessage.find().sort({ sentAt: -1 }),
      SupportMessage.find().sort({ sentAt: -1 })
    ]);
    return ok(res, "Tickets fetched", { users, drivers });
  } catch (err) { return next(err); }
});

router.get("/:id", protectAdmin(), async (req, res, next) => {
  try {
    const u = await UserSupportMessage.findById(req.params.id);
    if (u) return ok(res, "User ticket", u);
    const d = await SupportMessage.findById(req.params.id);
    if (d) return ok(res, "Driver ticket", d);
    throw new ApiError(404, "Ticket not found");
  } catch (err) { return next(err); }
});

export default router;

