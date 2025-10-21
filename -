import cron from "node-cron";
import Vehicle from "./models/Vehicle.js";
import Reminder from "./models/Reminder.js";

// كل يوم الساعة 9 صباحًا
cron.schedule("0 9 * * *", async () => {
  try {
    const vehicles = await Vehicle.find({
      nextOilChange: { $exists: true },
      odometer: { $exists: true },
    });
    for (const v of vehicles) {
      const remaining = (v.nextOilChange || 0) - (v.odometer || 0);
      if (remaining <= 500) {
        await Reminder.create({
          driverId: v.driverId,
          title: "قرب تغيير الزيت",
          details: `باقي ${remaining} كم للوصول إلى ${v.nextOilChange} كم`,
          dueDate: new Date(),
        });
      }
    }
    console.log("⏰ Oil reminders job ran");
  } catch (e) {
    console.error("Cron error:", e.message);
  }
});
