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
import chatRoutes from "./routes/Driver-Routes/chatRoute.js";
import driverRoutes from "./routes/Driver-Routes/driverRoute.js";
import earningsRoutes from "./routes/Driver-Routes/earningsRoute.js";
import fuelRoutes from "./routes/Driver-Routes/fuelRoute.js";
import locationRoutes from "./routes/Driver-Routes/locationRoute.js";
import maintenanceRoutes from "./routes/Driver-Routes/maintenanceRoute.js";
import notificationRoutes from "./routes/Driver-Routes/notificationRoute.js";
import oilRoutes from "./routes/Driver-Routes/oilRoute.js";
import profileRoutes from "./routes/Driver-Routes/profileRoute.js";
import ratingRoutes from "./routes/Driver-Routes/ratingRoute.js";
import reminderRoutes from "./routes/Driver-Routes/reminderRoute.js";
import settingsRoutes from "./routes/Driver-Routes/settingsRoute.js";
import statusRoutes from "./routes/Driver-Routes/statusRoute.js";
import summaryRoutes from "./routes/Driver-Routes/summaryRoute.js";
import supportRoutes from "./routes/Driver-Routes/supportRoute.js";
import tripRoutes from "./routes/Driver-Routes/tripRoute.js";
import vehicleRoutes from "./routes/Driver-Routes/vehicleRoute.js";
import userRoutes from "./routes/User-Routes/userRoute.js";
import userChatRoutes from "./routes/User-Routes/userChatRoute.js";
import userFavoritesRoutes from "./routes/User-Routes/userFavoritesRoute.js";
import userLocationRoutes from "./routes/User-Routes/userLocationRoute.js";
import userNotificationsRoutes from "./routes/User-Routes/userNotificationsRoute.js";
import userProfileRoutes from "./routes/User-Routes/userProfileRoute.js";
import userRateAppRoutes from "./routes/User-Routes/userRateAppRoute.js";
import userSummaryRoutes from "./routes/User-Routes/userSummaryRoute.js";
import userSupportRoutes from "./routes/User-Routes/userSupportRoute.js";
import userWalletRoutes from "./routes/User-Routes/userWalletRoute.js";
import { initSocket } from "./socket.js";

import userTripRoutes from "./routes/User-Routes/userTripRoute.js";
// Admin routes
import adminAuthRoutes from "./routes/Admin-Routes/adminAuthRoute.js";
import adminDriversRoutes from "./routes/Admin-Routes/adminDriversRoute.js";
import adminUsersRoutes from "./routes/Admin-Routes/adminUsersRoute.js";
import adminTripsRoutes from "./routes/Admin-Routes/adminTripsRoute.js";
import adminChatRoutes from "./routes/Admin-Routes/adminChatRoute.js";
import adminVehicleRoutes from "./routes/Admin-Routes/adminVehicleRoute.js";
import adminEarningsRoutes from "./routes/Admin-Routes/adminEarningsRoute.js";
import adminNotificationsRoutes from "./routes/Admin-Routes/adminNotificationsRoute.js";
import adminSettingsRoutes from "./routes/Admin-Routes/adminSettingsRoute.js";
import adminLiveRoutes from "./routes/Admin-Routes/adminLiveRoute.js";
import adminReportsRoutes from "./routes/Admin-Routes/adminReportsRoute.js";
import adminSupportRoutes from "./routes/Admin-Routes/adminSupportRoute.js";
import adminVerifyRoutes from "./routes/Admin-Routes/adminVerifyRoute.js";





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

// Admin route mounts
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/drivers", adminDriversRoutes);
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/admin/trips", adminTripsRoutes);
app.use("/api/admin/chat", adminChatRoutes);
app.use("/api/admin/vehicles", adminVehicleRoutes);
app.use("/api/admin/earnings", adminEarningsRoutes);
app.use("/api/admin/notifications", adminNotificationsRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/admin/live", adminLiveRoutes);
app.use("/api/admin/reports", adminReportsRoutes);
app.use("/api/admin/support", adminSupportRoutes);
app.use("/api/admin/verify", adminVerifyRoutes);

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

