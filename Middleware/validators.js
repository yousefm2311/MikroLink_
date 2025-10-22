import { body } from "express-validator";

export const signupValidator = [
  body("fullName").trim().notEmpty().withMessage("الاسم مطلوب"),
  body("phone").trim().notEmpty().withMessage("رقم الجوال مطلوب"),
  body("email").isEmail().withMessage("بريد إلكتروني صالح مطلوب"),
  body("password").isLength({ min: 6 }).withMessage("كلمة المرور يجب ألا تقل عن 6 أحرف"),
];

export const loginValidator = [
  body("email").optional().isEmail().withMessage("بريد إلكتروني صالح مطلوب"),
  body("password").notEmpty().withMessage("كلمة المرور مطلوبة"),
];

export const resendVerificationValidator = [
  body("email").isEmail().withMessage("بريد إلكتروني صالح مطلوب"),
];

export const forgotPasswordValidator = [
  body("email").isEmail().withMessage("بريد إلكتروني صالح مطلوب"),
];

export const verifyResetCodeValidator = [
  body("email").isEmail().withMessage("بريد إلكتروني صالح مطلوب"),
  body("code").isLength({ min: 4 }).withMessage("رمز التحقق غير صالح"),
];

export const resetPasswordValidator = [
  body("email").isEmail().withMessage("بريد إلكتروني صالح مطلوب"),
  body("code").isLength({ min: 4 }).withMessage("رمز التحقق غير صالح"),
  body("newPassword").isLength({ min: 6 }).withMessage("كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف"),
];

export const changePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("كلمة المرور الحالية مطلوبة"),
  body("newPassword").isLength({ min: 6 }).withMessage("كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف"),
];

export const vehicleUpsertValidator = [
  body("plateNumber").optional().isString(),
  body("model").optional().isString(),
  body("fuelLevel").optional().isNumeric(),
  body("odometer").optional().isNumeric(),
  body("nextOilChange").optional().isNumeric(),
];

// Fuel
export const fuelCreateValidator = [
  body("liters").isFloat({ gt: 0 }).withMessage("قيمة اللترات يجب أن تكون أكبر من 0"),
  body("cost").isFloat({ gt: 0 }).withMessage("قيمة التكلفة يجب أن تكون أكبر من 0"),
  body("odometer").optional().isFloat({ gt: 0 }).withMessage("عداد المسافة يجب أن يكون أكبر من 0"),
  body("stationName").optional().isString(),
];

// Location
export const liveLocationValidator = [
  body("latitude").isFloat().withMessage("إحداثيات خط العرض مطلوبة وصحيحة"),
  body("longitude").isFloat().withMessage("إحداثيات خط الطول مطلوبة وصحيحة"),
];

export const tripLocationCreateValidator = [
  body("tripId").notEmpty().withMessage("معرف الرحلة مطلوب"),
  body("latitude").isFloat().withMessage("إحداثيات خط العرض مطلوبة وصحيحة"),
  body("longitude").isFloat().withMessage("إحداثيات خط الطول مطلوبة وصحيحة"),
];

// Maintenance
export const maintenanceCreateValidator = [
  body("type").notEmpty().withMessage("نوع الصيانة مطلوب"),
  body("date").optional().isISO8601().toDate(),
  body("odometer").optional().isFloat({ gt: 0 }),
  body("cost").optional().isFloat({ min: 0 }),
  body("notes").optional().isString(),
];

// Oil
export const oilUpdateValidator = [
  body("odometer").isFloat({ gt: 0 }).withMessage("عداد المسافة يجب أن يكون أكبر من 0"),
  body("nextOilChange").isFloat({ gt: 0 }).withMessage("المسافة حتى تغيير الزيت يجب أن تكون أكبر من 0"),
];

// Reminder
export const reminderCreateValidator = [
  body("title").notEmpty().withMessage("عنوان التذكير مطلوب"),
  body("details").optional().isString(),
  body("dueDate").optional().isISO8601().toDate(),
];

// Settings
export const settingsUpdateValidator = [
  body("language").optional().isString(),
  body("darkMode").optional().isBoolean(),
  body("notifications").optional(),
];

// Support
export const supportCreateValidator = [
  body("message").trim().notEmpty().withMessage("نص الرسالة مطلوب"),
];

// Trip
export const tripStartValidator = [
  body("passengerName").notEmpty().withMessage("اسم الراكب مطلوب"),
  body("pickupLocation").notEmpty().withMessage("موقع الانطلاق مطلوب"),
  body("dropoffLocation").notEmpty().withMessage("موقع الوصول مطلوب"),
  body("fare").optional().isFloat({ min: 0 }),
  body("distance").optional().isFloat({ min: 0 }),
];

