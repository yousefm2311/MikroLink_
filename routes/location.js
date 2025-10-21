import express from "express";
import { protect } from "../Middleware/auth.js"; // ✅ تأكد أن اسم الفولدر small letters
import Driver from "../models/Driver.js";
import DriverLocation from "../models/DriverLocation.js";
import TripLocation from "../models/TripLocation.js";


const router = express.Router();

/* ============================================================
   🟢 1) تحديث الموقع اللحظي (Live Location)
   ============================================================ */
router.post("/live", protect, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res
        .status(400)
        .json({ message: "latitude و longitude لازم يكونوا أرقام" });
    }

    const loc = await DriverLocation.findOneAndUpdate(
      { driverId: req.driver._id },
      { latitude, longitude, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    await Driver.findByIdAndUpdate(req.driver._id, { isOnline: true });
    res.json({ message: "✅ تم تحديث الموقع بنجاح", location: loc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ أثناء تحديث الموقع" });
  }
});

/* ============================================================
   🔵 2) جلب الموقع اللحظي الحالي للسائق
   ============================================================ */
router.get("/live", protect, async (req, res) => {
  try {
    const loc = await DriverLocation.findOne({ driverId: req.driver._id });
    if (!loc) return res.json({ message: "لا يوجد موقع محفوظ بعد" });
    res.json(loc);
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب الموقع" });
  }
});

/* ============================================================
   🟣 3) عرض كل السائقين الأونلاين (للمستخدمين)
   ============================================================ */
// 🔹 عرض كل السائقين الأونلاين
// 🔹 عرض كل السائقين الأونلاين مع حساب المسافة من المستخدم
// 🔹 عرض كل السائقين الأونلاين مع حساب المسافة والوقت التقريبي (ETA)
// 🔹 عرض السائقين الأونلاين مع ترتيبهم حسب القرب ونوع المركبة
router.get("/available", async (req, res) => {
  try {
    // 📍 موقع المستخدم (من الرابط)
    const userLat = parseFloat(req.query.latitude);
    const userLon = parseFloat(req.query.longitude);
    const filterVehicle = req.query.vehicleType; // 🚗 نوع العربية (اختياري)

    if (!userLat || !userLon) {
      return res.status(400).json({
        message: "يجب إرسال latitude و longitude في الرابط",
      });
    }

    // 🧩 نجلب كل السائقين الأونلاين فقط
    const drivers = await DriverLocation.find()
      .populate("driverId", "fullName phone vehicleType isOnline")
      .sort({ updatedAt: -1 });

    const onlineDrivers = drivers.filter(
      (d) => d.driverId?.isOnline === true
    );

    // 🧮 دالة حساب المسافة (Haversine Formula)
    const calcDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // كم
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const averageSpeed = 35; // كم/س — سرعة متوسطة داخل المدينة

    // 📏 حساب المسافة و ETA لكل سائق
    let driversWithDistance = onlineDrivers.map((d) => {
      const distanceKm = calcDistance(userLat, userLon, d.latitude, d.longitude);
      const timeHours = distanceKm / averageSpeed;
      const etaMinutes = Math.ceil(timeHours * 60);

      return {
        driverId: d.driverId._id,
        name: d.driverId.fullName,
        phone: d.driverId.phone,
        vehicleType: d.driverId.vehicleType,
        latitude: d.latitude,
        longitude: d.longitude,
        distanceKm: +distanceKm.toFixed(2),
        etaMinutes,
        updatedAt: d.updatedAt,
      };
    });

    // 🚗 لو المستخدم بعت vehicleType نفلتر عليه
    if (filterVehicle) {
      driversWithDistance = driversWithDistance.filter(
        (d) => d.vehicleType?.toLowerCase() === filterVehicle.toLowerCase()
      );
    }

    // 🔢 نرتب حسب الأقرب
    driversWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      userLocation: { latitude: userLat, longitude: userLon },
      vehicleFilter: filterVehicle || "الكل",
      count: driversWithDistance.length,
      drivers: driversWithDistance,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});





/* ============================================================
   🟤 4) حفظ نقطة موقع جديدة (أثناء الرحلة)
   ============================================================ */
router.post("/", protect, async (req, res) => {
  try {
    const { tripId, latitude, longitude } = req.body;
    if (!tripId || !latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "يجب إرسال tripId و latitude و longitude" });
    }

    const loc = await TripLocation.create({
      tripId,
      driverId: req.driver._id,
      latitude,
      longitude,
    });

    res.json({ message: "✅ تم حفظ نقطة الموقع بنجاح", loc });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء حفظ الموقع" });
  }
});

/* ============================================================
   ⚫ 5) عرض كل النقاط الخاصة برحلة معينة
   ============================================================ */
router.get("/:tripId", protect, async (req, res) => {
  try {
    const locations = await TripLocation.find({ tripId: req.params.tripId });
    res.json({
      tripId: req.params.tripId,
      count: locations.length,
      locations,
    });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب النقاط" });
  }
});

export default router;
