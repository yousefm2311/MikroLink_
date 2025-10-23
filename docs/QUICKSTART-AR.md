# MikroLink – دليل تشغيل سريع (AR)

هذا الملف يلخّص أهم الخطوات لتشغيل الـ Backend محليًا وتجربة أهم الواجهات (Drivers / Users / Admin) — مع روابط سريعة وأوامر جاهزة.

---

## 1) المتطلبات
- Node.js 18+ (أو LTS)
- MongoDB قيد التشغيل محليًا أو عبر URI خارجي

---

## 2) الإعداد
1) انسخ المتغيرات:
   - أنشئ ملف `.env` من `.env.example` وعدّل القيم: `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `APP_URL`, `EMAIL_*`, `CORS_ORIGIN`.
   - (اختياري للأدمن): `ADMIN_BOOTSTRAP_SECRET=<secret>` لإنشاء أول SuperAdmin.
2) تثبيت الحزم:
   ```bash
   npm install
   ```
3) التشغيل:
   ```bash
   npm run dev
   ```
4) الفحص السريع:
   - واجهة Socket اختبار: `GET {{APP_URL}}/public/socket-test.html`
   - رفع الملفات الثابتة من `uploads/` فعّال على `{{APP_URL}}/uploads/...`

---

## 3) التوثيق وملفات Postman
- توثيق شامل (EN): `docs/API-REFERENCE.md`
- توثيق شامل (AR): `docs/API-REFERENCE-AR.md`
- Postman (Admin فقط): `docs/Admin.postman_collection.json`
- Postman (جميع الـ APIs): `docs/MikroLink-All.postman_collection.json`

استورد أي Collection داخل Postman ثم ضبط المتغيرات:
- `baseUrl` = `http://localhost:5000`
- `driverToken`, `userToken`, `adminToken` بعد تسجيل الدخول
- معرفات (`driverId`, `tripId`, ...)

---

## 4) تهيئة أول SuperAdmin (اختياري)
إذا لا يوجد أي أدمن بعد:
1) ضع في `.env`:
   ```
   ADMIN_BOOTSTRAP_SECRET=SuperSecret#2025
   ```
2) نادِ (مرة واحدة فقط):
   ```http
   POST {{baseUrl}}/api/admin/auth/bootstrap
   Headers:
     x-admin-bootstrap: SuperSecret#2025
     Content-Type: application/json
   Body:
   {
     "fullName": "Super Admin",
     "email": "super@mikrolink.com",
     "password": "Pass#1234"
   }
   ```
3) بعدها سجل دخول الأدمن عبر `/api/admin/auth/login`، وخزّن `{{adminToken}}` لاستخدامه في بقية مسارات الأدمن.

---

## 5) ملخص المجموعات (نظرة سريعة)
- Drivers (`/api/...`): auth, profile, vehicle, trip, earnings, rating, notification, status, location, summary, support, fuel, chat
- Users (`/api/user/...`): auth, profile, trip (request/rate), chat, location, favorites, notifications, wallet, support, rate-app, summary
- Admin (`/api/admin/...`): auth, drivers, users, trips, chat, vehicles, earnings, notifications, settings, live, reports, support, verify

ملاحظة: الحظر (Block)
- الأدمن يمكنه حظر/إلغاء حظر السائق/المستخدم.
- الحساب المحظور لا يمكنه تسجيل الدخول أو استخدام الواجهات المحمية.

---

## 6) Socket.io (سريع)
- العنوان: `ws://localhost:5000`
- أحداث مهمة:
  - `join:trip` → ينضم لغرفة `trip:<tripId>`
  - `location:update` → `{ driverId, latitude, longitude, tripId? }`
  - `chat:send` → `{ tripId, senderId, receiverId?, text }`
- صفحة اختبار: `/public/socket-test.html`

---

## 7) استكشاف الأخطاء الشائعة
- `Cast to ObjectId failed` → تأكد أن `:id` في الرابط ObjectId صحيح (وليس نص `:id`).
- `Unauthorized: Bearer token is missing` → أرسل الهيدر `Authorization: Bearer <token>`.
- `Account is blocked` → الحساب محظور بواسطة الأدمن؛ ألغ الحظر أولًا.
- رفع صور المستخدم كبير → تم ضغط الصور تلقائيًا عبر `sharp` وحفظ رابط عام.

---

## 8) أوامر مفيدة
- تثبيت الحزم: `npm install`
- تشغيل التطوير: `npm run dev`
- تشغيل الإنتاج: `npm start` (تأكد من تهيئة `.env`)

---

بالتوفيق! لأي تطوير إضافي (مثل تصدير PDF، أو توثيق Swagger/OpenAPI)، يمكنني إضافتها بسهولة.
