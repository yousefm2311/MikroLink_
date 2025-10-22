// import mongoose from "mongoose";

// const tripSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },

//     origin: { type: String, required: true },
//     destination: { type: String, required: true },
//     distance: { type: Number },
//     price: { type: Number },

//     status: {
//       type: String,
//       enum: ["pending", "accepted", "in-progress", "completed", "cancelled"],
//       default: "pending",
//     },

//     startedAt: { type: Date },
//     completedAt: { type: Date },
//   },
//   { timestamps: true }
// );

// const Trip = mongoose.model("Trip", tripSchema);
// export default Trip;
