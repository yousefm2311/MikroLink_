import mongoose from "mongoose";

const fuelSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  date: { type: Date, default: Date.now },
  liters: Number,
  cost: Number,
  odometer: Number,
  stationName: String,
});

export default mongoose.model("Fuel", fuelSchema);

