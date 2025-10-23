import express from "express";
import { protectAdmin } from "../../Middleware/auth.js";
import Message from "../../models/Driver-Model/Message.js";
import { ok } from "../../utils/api-response.js";
import ApiError from "../../utils/ApiError.js";

const router = express.Router();

router.get("/", protectAdmin(), async (req, res, next) => {
  try { const list = await Message.find().sort({ timestamp: -1 }).limit(500); return ok(res, "Chats fetched", list); }
  catch (err) { return next(err); }
});

router.get("/:tripId", protectAdmin(), async (req, res, next) => {
  try { const list = await Message.find({ tripId: req.params.tripId }).sort({ timestamp: 1 }); return ok(res, "Trip messages", list); }
  catch (err) { return next(err); }
});

router.delete("/message/:messageId", protectAdmin(), async (req, res, next) => {
  try { const msg = await Message.findById(req.params.messageId); if (!msg) throw new ApiError(404, "Message not found"); await msg.deleteOne(); return ok(res, "Message deleted"); }
  catch (err) { return next(err); }
});

export default router;
