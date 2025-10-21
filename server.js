import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import driverRoutes from "./routes/driver.js";
import earningsRoutes from "./routes/earnings.js";
import locationRoutes from "./routes/location.js";
import maintenanceRoutes from "./routes/maintenance.js";
import notificationRoutes from "./routes/notification.js";
import oilRoutes from "./routes/oil.js";
import profileRoutes from "./routes/profile.js";
import ratingRoutes from "./routes/rating.js";
import reminderRoutes from "./routes/reminder.js";
import settingsRoutes from "./routes/settings.js";
import statusRoutes from "./routes/status.js";
import summaryRoutes from "./routes/summary.js";
import supportRoutes from "./routes/support.js";
import tripRoutes from "./routes/trip.js";
import vehicleRoutes from "./routes/vehicle.js";
import fuelRoutes from "./routes/fuel.js";
import path from "path";
import { fileURLToPath } from "url";
import { notFound, errorHandler } from "./Middleware/errorHandler.js";

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(helmet());
app.use(compression());
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: corsOrigin, credentials: true }));

// Optional basic rate limiting (lenient by default)
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: Number(process.env.RATE_LIMIT_MAX || 1000) });
app.use(limiter);

// Routes
app.use("/api/driver", driverRoutes);
app.use("/api/vehicle", vehicleRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/oil", oilRoutes);
app.use("/api/reminder", reminderRoutes);
app.use("/api/trip", tripRoutes);
app.use("/api/earnings", earningsRoutes);
app.use("/api/rating", ratingRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/status", statusRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/location", locationRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/fuel", fuelRoutes);

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

// Load scheduled daily jobs
import "./Jobs/cron.js";

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// 10-minute inactivity job (kept as-is)
import cron from "node-cron";
import Driver from "./models/driver.model.js";
import DriverLocation from "./models/driver-location.model.js";

cron.schedule("*/10 * * * *", async () => {
  try {
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    const inactiveDrivers = await DriverLocation.find({
      updatedAt: { $lt: tenMinsAgo },
    });

    for (const loc of inactiveDrivers) {
      await Driver.findByIdAndUpdate(loc.driverId, { isOnline: false });
    }

    console.log(`Inactive drivers set offline: ${inactiveDrivers.length}`);
  } catch (err) {
    console.error("Error in inactivity job:", err.message);
  }
});
