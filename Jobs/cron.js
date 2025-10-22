import cron from "node-cron";
import Vehicle from "../models/Driver-Model/vehicle.model.js";
import Reminder from "../models/Driver-Model/reminder.model.js";

// Job: create oil change reminders daily at 9:00
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
          title: "تذكير تغيير الزيت",
          details: `متبقي ${remaining} كم للوصول إلى ${v.nextOilChange} كم`,
          dueDate: new Date(),
        });
      }
    }
    console.log("[cron] Oil reminders job ran");
  } catch (e) {
    console.error("[cron] error:", e.message);
  }
});

