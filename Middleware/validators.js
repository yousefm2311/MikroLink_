import { body } from "express-validator";

export const signupValidator = [
  body("fullName").trim().notEmpty().withMessage("الاسم مطلوب"),
  body("phone").trim().notEmpty().withMessage("رقم الهاتف مطلوب"),
  body("email").isEmail().withMessage("بريد إلكتروني غير صالح"),
  body("password").isLength({ min: 6 }).withMessage("الحد الأدنى 6 أحرف"),
];

export const loginValidator = [
  body("email").isEmail().withMessage("بريد إلكتروني غير صالح"),
  body("password").notEmpty().withMessage("كلمة المرور مطلوبة"),
];

export const resendVerificationValidator = [
  body("email").isEmail().withMessage("بريد إلكتروني غير صالح"),
];

export const forgotPasswordValidator = [
  body("email").isEmail().withMessage("بريد إلكتروني غير صالح"),
];

export const verifyResetCodeValidator = [
  body("email").isEmail().withMessage("بريد إلكتروني غير صالح"),
  body("code").isLength({ min: 4 }).withMessage("رمز غير صالح"),
];

export const resetPasswordValidator = [
  body("email").isEmail().withMessage("بريد إلكتروني غير صالح"),
  body("code").isLength({ min: 4 }).withMessage("رمز غير صالح"),
  body("newPassword").isLength({ min: 6 }).withMessage("الحد الأدنى 6 أحرف"),
];

export const changePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("مطلوب"),
  body("newPassword").isLength({ min: 6 }).withMessage("الحد الأدنى 6 أحرف"),
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
  body("liters").isFloat({ gt: 0 }).withMessage("اللترات مطلوبة وموجبة"),
  body("cost").isFloat({ gt: 0 }).withMessage("التكلفة مطلوبة وموجبة"),
  body("odometer").optional().isFloat({ gt: 0 }).withMessage("قراءة العداد غير صالحة"),
  body("stationName").optional().isString(),
];

// Location
export const liveLocationValidator = [
  body("latitude").isFloat().withMessage("إحداثيات غير صالحة"),
  body("longitude").isFloat().withMessage("إحداثيات غير صالحة"),
];

export const tripLocationCreateValidator = [
  body("tripId").notEmpty().withMessage("معرف الرحلة مطلوب"),
  body("latitude").isFloat().withMessage("إحداثيات غير صالحة"),
  body("longitude").isFloat().withMessage("إحداثيات غير صالحة"),
];

// Maintenance
export const maintenanceCreateValidator = [
  body("type").notEmpty().withMessage("النوع مطلوب"),
  body("date").optional().isISO8601().toDate(),
  body("odometer").optional().isFloat({ gt: 0 }),
  body("cost").optional().isFloat({ min: 0 }),
  body("notes").optional().isString(),
];

// Oil
export const oilUpdateValidator = [
  body("odometer").isFloat({ gt: 0 }).withMessage("قراءة العداد مطلوبة"),
  body("nextOilChange").isFloat({ gt: 0 }).withMessage("قراءة الصيانة القادمة مطلوبة"),
];

// Reminder
export const reminderCreateValidator = [
  body("title").notEmpty().withMessage("العنوان مطلوب"),
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
  body("message").trim().notEmpty().withMessage("الرسالة مطلوبة"),
];

// Trip
export const tripStartValidator = [
  body("passengerName").notEmpty().withMessage("اسم الراكب مطلوب"),
  body("pickupLocation").notEmpty().withMessage("موقع الانطلاق مطلوب"),
  body("dropoffLocation").notEmpty().withMessage("موقع الوصول مطلوب"),
  body("fare").optional().isFloat({ min: 0 }),
  body("distance").optional().isFloat({ min: 0 }),
];

