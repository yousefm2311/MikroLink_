import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createServer } from "http";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./Middleware/errorHandler.js";
import chatRoutes from "./routes/Driver-Routes/chat.js";
import driverRoutes from "./routes/Driver-Routes/driver.js";
import earningsRoutes from "./routes/Driver-Routes/earnings.js";
import fuelRoutes from "./routes/Driver-Routes/fuel.js";
import locationRoutes from "./routes/Driver-Routes/location.js";
import maintenanceRoutes from "./routes/Driver-Routes/maintenance.js";
import notificationRoutes from "./routes/Driver-Routes/notification.js";
import oilRoutes from "./routes/Driver-Routes/oil.js";
import profileRoutes from "./routes/Driver-Routes/profile.js";
import ratingRoutes from "./routes/Driver-Routes/rating.js";
import reminderRoutes from "./routes/Driver-Routes/reminder.js";
import settingsRoutes from "./routes/Driver-Routes/settings.js";
import statusRoutes from "./routes/Driver-Routes/status.js";
import summaryRoutes from "./routes/Driver-Routes/summary.js";
import supportRoutes from "./routes/Driver-Routes/support.js";
import tripRoutes from "./routes/Driver-Routes/trip.js";
import vehicleRoutes from "./routes/Driver-Routes/vehicle.js";
import { initSocket } from "./socket.js";
import userRoutes from "./routes/user.js";
import userProfileRoutes from "./routes/userProfile.js";
import userChatRoutes from "./routes/userChat.js";
import userLocationRoutes from "./routes/userLocation.js";
import userFavoritesRoutes from "./routes/userFavorites.js";
import userNotificationsRoutes from "./routes/userNotifications.js";
import userWalletRoutes from "./routes/userWallet.js";
import userSupportRoutes from "./routes/userSupport.js";
import userRateAppRoutes from "./routes/userRateApp.js";
import userSummaryRoutes from "./routes/userSummary.js";

import userTripRoutes from "./routes/userTrip.js";





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
app.use("/api/chat", chatRoutes);
app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/api/user", userRoutes);
app.use("/api/user/auth", userRoutes);
app.use("/api/user/profile", userProfileRoutes);
app.use("/api/user/trip", userTripRoutes);
app.use("/api/user/trips", userTripRoutes);
app.use("/api/user/chat", userChatRoutes);
app.use("/api/user/location", userLocationRoutes);
app.use("/api/user/favorites", userFavoritesRoutes);
app.use("/api/user/notifications", userNotificationsRoutes);
app.use("/api/user/wallet", userWalletRoutes);
app.use("/api/user/support", userSupportRoutes);
app.use("/api/user/rate-app", userRateAppRoutes);
app.use("/api/user/summary", userSummaryRoutes);

app.use(express.static("public"));
// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

// Load scheduled daily jobs
import "./Jobs/cron.js";

// Start HTTP server + Socket.io
const server = createServer(app);
const PORT = process.env.PORT || 5000;
initSocket(server);
server.listen(PORT, () => console.log(`?? Server running on port ${PORT}`));

// 10-minute inactivity job (kept as-is)
import cron from "node-cron";
import DriverLocation from "./models/Driver-Model/driver-location.model.js";
import Driver from "./models/Driver-Model/driver.model.js";

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
