export const MESSAGES = {
  auth: {
    signup_success: 'تم إنشاء الحساب بنجاح، برجاء التحقق من البريد الإلكتروني.',
    email_in_use: 'هذا البريد مسجّل بالفعل.',
    phone_in_use: 'رقم الهاتف مسجّل بالفعل.',
    verify_subject: 'تأكيد البريد الإلكتروني - MikroLink',
    verify_heading: 'مرحباً بك في MikroLink',
    verify_sent: 'تم إرسال رسالة تأكيد البريد الإلكتروني.',
    verify_done: 'تم تأكيد البريد الإلكتروني بنجاح. يمكنك تسجيل الدخول الآن.',
    verify_invalid: 'رابط التحقق غير صالح أو منتهي.',
    login_invalid: 'بيانات الدخول غير صحيحة.',
    login_unverified: 'يرجى تأكيد البريد الإلكتروني أولاً.',
    login_success: 'تم تسجيل الدخول بنجاح.',
    refresh_missing: 'مطلوب Refresh Token.',
    refresh_invalid: 'Refresh Token غير صالح.',
    refresh_success: 'تم تحديث رمز الوصول.',
    logout_success: 'تم تسجيل الخروج بنجاح.',
    forgot_sent: 'تم إرسال رمز استعادة كلمة المرور إلى بريدك.',
    code_invalid: 'الرمز غير صالح أو منتهي.',
    reset_success: 'تم تحديث كلمة المرور بنجاح.',
    change_success: 'تم تغيير كلمة المرور بنجاح.',
    unauthorized: 'غير مصرح. يرجى تسجيل الدخول.',
  },
  profile: {
    fetched: 'تم جلب الملف الشخصي.',
    updated: 'تم تحديث الملف الشخصي بنجاح.',
    upload_success: 'تم رفع المستندات بنجاح.',
    not_found: 'المستخدم غير موجود.',
  },
  vehicle: {
    not_found: 'لا توجد مركبة مسجلة.',
    upserted: 'تم إنشاء/تحديث بيانات المركبة بنجاح.',
  },
  fuel: {
    created: 'تم إضافة سجل الوقود بنجاح.',
    list: 'تم جلب سجلات الوقود.',
    summary: 'ملخص الوقود.',
  },
  location: {
    live_updated: 'تم تحديث الموقع الحي بنجاح.',
    live_not_found: 'لا يوجد موقع حي مسجل.',
    available_result: 'تم جلب السائقين المتاحين.',
    trip_loc_created: 'تم حفظ نقطة مسار الرحلة.',
    trip_locations: 'تم جلب نقاط مسار الرحلة.',
  },
  maintenance: {
    created: 'تم إضافة سجل الصيانة.',
    list: 'تم جلب سجلات الصيانة.',
  },
  notification: {
    list: 'تم جلب الإشعارات.',
  },
  oil: {
    updated: 'تم تحديث معلومات تغيير الزيت.',
    fetched: 'تم جلب معلومات تغيير الزيت.',
    vehicle_missing: 'لا توجد مركبة مسجلة لهذا المستخدم.',
  },
  rating: {
    list: 'تم جلب التقييمات.',
  },
  reminder: {
    created: 'تم إضافة تذكير.',
    list: 'تم جلب التذكيرات.',
    not_found: 'التذكير غير موجود.',
    marked_read: 'تم وضع علامة مقروء.',
  },
  settings: {
    fetched: 'تم جلب الإعدادات.',
    updated: 'تم تحديث الإعدادات.',
  },
  status: {
    online: 'أنت الآن متصل.',
    offline: 'تم التحويل إلى غير متصل.',
  },
  summary: {
    fetched: 'تم جلب الملخص.',
    weekly: 'ملخص الأسبوع.',
  },
  support: {
    sent: 'تم إرسال الرسالة إلى الدعم.',
    list: 'تم جلب رسائل الدعم.',
  },
  system: {
    ok: 'تمت العملية بنجاح.',
    bad_request: 'طلب غير صالح.',
  },
};
