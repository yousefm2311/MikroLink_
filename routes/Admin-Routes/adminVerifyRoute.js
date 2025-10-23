import express from "express";
import { protectAdmin } from "../../Middleware/auth.js";
import Driver from "../../models/Driver-Model/driver.model.js";
import Vehicle from "../../models/Driver-Model/vehicle.model.js";
import { ok } from "../../utils/api-response.js";
import ApiError from "../../utils/ApiError.js";

const router = express.Router();

router.get("/pending", protectAdmin(), async (req, res, next) => {
  try {
    const drivers = await Driver.find({ documentsVerified: false });
    const vehicles = await Vehicle.find({ approved: false });
    return ok(res, "Pending verifications", { drivers, vehicles });
  } catch (err) { return next(err); }
});

router.put("/:id/approve", protectAdmin(), async (req, res, next) => {
  try {
    const d = await Driver.findByIdAndUpdate(req.params.id, { documentsVerified: true }, { new: true });
    if (!d) throw new ApiError(404, "Driver not found");
    return ok(res, "Driver documents approved", d);
  } catch (err) { return next(err); }
});

router.put("/:id/reject", protectAdmin(), async (req, res, next) => {
  try {
    const d = await Driver.findByIdAndUpdate(req.params.id, { documentsVerified: false }, { new: true });
    if (!d) throw new ApiError(404, "Driver not found");
    return ok(res, "Driver documents rejected", d);
  } catch (err) { return next(err); }
});

export default router;

