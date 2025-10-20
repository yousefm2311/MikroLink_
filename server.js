import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import driverRoutes from "./routes/driver.js";
import earningsRoutes from "./routes/earnings.js";
import maintenanceRoutes from "./routes/maintenance.js";
import notificationRoutes from "./routes/notification.js";
import oilRoutes from "./routes/oil.js";
import profileRoutes from "./routes/profile.js";
import ratingRoutes from "./routes/rating.js";
import reminderRoutes from "./routes/reminder.js";
import settingsRoutes from "./routes/settings.js";
import statusRoutes from "./routes/status.js";
import supportRoutes from "./routes/support.js";
import tripRoutes from "./routes/trip.js";
import vehicleRoutes from "./routes/vehicle.js";
import locationRoutes from "./routes/location.js";
import summaryRoutes from "./routes/summary.js";
import fuelRoutes from "./routes/fuel.js";










dotenv.config();
connectDB();

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
app.use(express.json());
app.use(cors());

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
// 🖼️ عرض الملفات داخل مجلد uploads مباشرة من المتصفح
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/location", locationRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/fuel", fuelRoutes);




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
