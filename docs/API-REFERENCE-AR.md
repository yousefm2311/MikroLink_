# دليل واجهات MikroLink (REST + Socket.io)

هذا الدليل يشرح بالتفصيل جميع واجهات MikroLink (Drivers + Users) وكيفية تشغيل الخادم محلياً، مع أمثلة للطلبات والاستجابات، وإدارة الأخطاء، وأحداث Socket.io للبث اللحظي للموقع والدردشة.

---

## الفهرس
- نظرة عامة
- التشغيل المحلي
- الاصطلاحات العامة والاعتمادات
- المصادقة والرموز (JWT)
- واجهات السائق Driver API (REST)
- واجهات المستخدم User API (REST)
- البث اللحظي Socket.io (الموقع + الدردشة)
- إدارة الأخطاء والتحقق
- الرفع والملفات
- المتغيرات البيئية
- أمثلة عملية (cURL وSocket)

---

## نظرة عامة
- التقنية: Node.js (ESM) + Express + MongoDB (Mongoose) + Socket.io
- نقطة البداية المحلية: `http://localhost:5000`
- الاستيثاق: JWT (Access + Refresh)
- ملفات ثابتة: `/uploads/*`، وصفحة اختبار Socket على `/public/socket-test.html`
- مجموعات Postman موجودة داخل مجلد `docs/`

---

## التشغيل المحلي
1) تثبيت المتطلبات: Node 18+ وMongoDB
2) نسخ `.env.example` إلى `.env` وتعبئة القيم
3) تثبيت الحزم: `npm install`
4) التشغيل: `npm run dev` (أو `npm start`)
5) فتح صفحة اختبار السوكيت: `http://localhost:5000/public/socket-test.html`

---

## الاصطلاحات العامة
- Content-Type: `application/json`
- رأس الاستيثاق: `Authorization: Bearer <ACCESS_TOKEN>` للواجهات المحمية
- صيغة النجاح القياسية:
  - `{ success: true, message: string, data?: any }`
- صيغة الخطأ القياسية:
  - `{ message: string, code?: string, details?: any[] }`
- التحقق عبر `express-validator`، الأخطاء ترجع في `details`

---

## المصادقة والرموز (JWT)
- Access Token (قصير المدى): 15 دقيقة
- Refresh Token (طويل المدى): 30 يومًا
- تدفق شائع: Signup → Verify Email → Login → استخدام Access → عند انتهاءه استخدم `/refresh` لتجديد → Logout لإلغاء الـ Refresh

---

## واجهات السائق Driver API (REST)
قاعدة المسار: `/api`

### مصادقة السائق – `/api/driver`
- POST `/signup` — إنشاء حساب: `{ fullName, phone, email, password }`
- POST `/resend-verification` — إعادة إرسال تحقق البريد: `{ email }`
- GET `/verify/:token` — تأكيد البريد عبر الرابط (ترجع HTML)
- POST `/login` — تسجيل الدخول: `{ email, password }`
  - استجابة: `{ accessToken, refreshToken, driver }`
- POST `/forgot-password` — إرسال كود الاستعادة: `{ email }`
- POST `/verify-reset-code` — التحقق من الكود: `{ email, code }`
- POST `/reset-password` — تعيين كلمة مرور جديدة: `{ email, code, newPassword }`
- POST `/change-password` (محمي) — `{ currentPassword, newPassword }`
- POST `/refresh` — تجديد Access: `{ refreshToken }`
- POST `/logout` — إلغاء Refresh: `{ refreshToken }`

### الملف الشخصي – `/api/profile` (محمي)
- GET `/` — جلب الملف الشخصي (بدون كلمة المرور)
- PUT `/` — تحديث `{ fullName?, phone? }`
- POST `/upload` (multipart) — الحقول: `idFront, idBack, license, carPhoto, profilePhoto` (حد 5MB وصور فقط)

### المركبة – `/api/vehicle` (محمي)
- GET `/` — جلب مركبة السائق
- POST `/` — إنشاء/تحديث: `{ plateNumber?, model?, fuelLevel?, odometer?, nextOilChange? }`

### الصيانة – `/api/maintenance` (محمي)
- POST `/` — إضافة سجل: `{ type, date?, odometer?, cost?, notes? }`
- GET `/` — سرد السجلات (تنازلي حسب التاريخ)

### الزيت – `/api/oil` (محمي)
- POST `/update` — تحديث `{ odometer, nextOilChange }`
- GET `/` — جلب معلومات الزيت + `distanceSinceChange`, `remaining`

### التذكيرات – `/api/reminder` (محمي)
- POST `/` — إنشاء: `{ title, details?, dueDate? }`
- GET `/` — قائمة التذكيرات
- PUT `/:id/read` — تعليم كمقروء

### الرحلات – `/api/trip` (محمي)
- GET `/` — قائمة الرحلات (تنازلي حسب `startedAt`)
- POST `/start` — بدء الرحلة: `{ passengerName, pickupLocation, dropoffLocation, fare?, distance? }`
- POST `/:id/complete` — إنهاء رحلة
- GET `/current` — الرحلة الحالية قيد التنفيذ (أو null)
- POST `/:id/cancel` — إلغاء
- GET `/history` — رحلات مكتملة (تنازلي)

### الأرباح – `/api/earnings` (محمي)
- GET `/today` — إجمالي اليوم `{ total, count }`
- GET `/month` — إجمالي الشهر `{ total, count }`

### التقييم – `/api/rating` (محمي)
- GET `/` — `{ average, count, ratings }`

### الإشعارات – `/api/notification` (محمي)
- GET `/` — قائمة إشعارات النظام

### الحالة – `/api/status` (محمي)
- PUT `/toggle` — عكس حالة الاتصال `isOnline`

### الموقع – `/api/location`
- POST `/live` (محمي) — تحديث الموقع الحالي: `{ latitude, longitude }` ويضبط `isOnline=true`
- GET `/live` (محمي) — آخر موقع حي
- GET `/available` (عام) — السائقون الأقرب وفق الإحداثيات + فلتر `vehicleType?`
- POST `/` (محمي) — حفظ نقطة مسار الرحلة: `{ tripId, latitude, longitude }`
- GET `/:tripId` (محمي) — نقاط مسار الرحلة

### الملخص – `/api/summary` (محمي)
- GET `/` — `{ totalTrips, totalEarnings, avgRating }`
- GET `/weekly` — `{ totalTrips, totalEarnings, avgRating, totalFuel, from, to }`

### الدعم – `/api/support` (محمي)
- POST `/` — إرسال رسالة دعم: `{ message }`
- GET `/` — استرجاع رسائل الدعم الخاصة بالسائق

### الوقود – `/api/fuel` (محمي)
- POST `/` — إضافة سجل: `{ liters, cost, odometer?, stationName? }`
- GET `/` — قائمة السجلات
- GET `/summary` — ملخص: `{ totalLiters, totalCost, averagePrice, recordsCount }`

### الدردشة – `/api/chat` (محمي)
- GET `/:tripId` — رسائل الرحلة السابقة مرتبة تصاعديًا حسب `timestamp`

---

## واجهات المستخدم User API (REST)
قاعدة المسار: `/api/user` وفروعها.
- المصادقة: `/signup`, `/login`, `/forgot-password`, `/verify/:token`, `/verify-reset-code`, `/reset-password`, `/change-password`, `/refresh`, `/logout`
- الملف الشخصي: `/api/user/profile` (GET/PUT)
- الرحلات: `/api/user/trip`, `/api/user/trips` (حسب التطبيق)
- الدردشة: `/api/user/chat` (حسب التطبيق)
- الموقع: `/api/user/location`
- المفضلات: `/api/user/favorites`
- الإشعارات: `/api/user/notifications`
- المحفظة: `/api/user/wallet`
- الدعم: `/api/user/support`
- تقييم التطبيق: `/api/user/rate-app`
- الملخص: `/api/user/summary`
> راجع ملفات الراوت داخل `routes/` لكل التفاصيل.

---

## البث اللحظي Socket.io
- نقطة الاتصال: `ws://localhost:5000`
- صفحة اختبار: `/public/socket-test.html`

### الغرف
- `join:trip` → `{ tripId }` → ينضم لغرفة `trip:<tripId>`

### الموقع الحي
- `location:update` → `{ driverId, latitude, longitude, tripId? }`
  - تحدّث DriverLocation
  - إن وُجد `tripId` يُضاف إلى TripLocation ويُبث إلى غرفة الرحلة
- يبث السيرفر `location:live` بالقيم `{ driverId, latitude, longitude, tripId?, ts }`

### الدردشة
- `chat:send` → `{ tripId, senderId, receiverId?, text }` يحفظ ويُبث `chat:new` للغرفة
- `chat:new` (من السيرفر إلى العملاء في الغرفة)
- `chat:typing` → `{ tripId, from, to?, isTyping }` مؤشر الكتابة

---

## إدارة الأخطاء والتحقق
- أخطاء التحقق: 400 مع `details: [{ field, msg }]`
- Auth: 401 (مفقود/غير صالح)، 403 (غير مصرح)، 404 (غير موجود)
- أخطاء الخادم: 500 برسالة عامة في الإنتاج

---

## الرفع والملفات
- مجلد الرفع: `/uploads`
- رفع مستندات السائق: `POST /api/profile/upload`
- القيود: 5MB، صور فقط (PNG/JPEG)

---

## المتغيرات البيئية
انظر `.env.example` لأهم المفاتيح: `PORT, APP_URL, MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET, EMAIL_USER, EMAIL_PASS, CORS_ORIGIN, RATE_LIMIT_MAX`

---

## أمثلة عملية

### مثال cURL – تسجيل دخول سائق
```bash
curl -X POST http://localhost:5000/api/driver/login \
  -H "Content-Type: application/json" \
  -d '{"email":"driver@example.com","password":"pass1234"}'
```
استجابة نموذجية:
```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح.",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "driver": { "_id": "...", "email": "driver@example.com", "verified": true }
  }
}
```

### مثال Socket.io – الموقع الحي
```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io("http://localhost:5000", { transports: ["websocket"] });
  socket.emit("join:trip", { tripId: "<tripId>" });
  socket.emit("location:update", { driverId: "<driverId>", latitude: 30.0, longitude: 31.0, tripId: "<tripId>" });
  socket.on("location:live", (p) => console.log("location", p));
  socket.on("chat:new", (m) => console.log("chat", m));
  socket.on("chat:typing", (t) => console.log("typing", t));
  // إرسال رسالة
  socket.emit("chat:send", { tripId: "<tripId>", senderId: "<driverId>", text: "Hi" });
</script>
```

---

## ملاحظات
- استخدم Postman collections داخل `docs/` للاختبار السريع.
- يفضّل استخدام Access Token في الرأس `Authorization` لجميع المسارات المحمية.

