import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  plateNumber: { type: String, required: true },
  model: String,
  fuelLevel: Number, // نسبة الوقود %
  odometer: Number, // العداد الحالي
  nextOilChange: Number, // الكيلومتر القادم لتغيير الزيت
  lastOilChangeDate: Date,
});

export default mongoose.model("Vehicle", vehicleSchema);
