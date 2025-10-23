import { Server } from "socket.io";
import DriverLocation from "./models/Driver-Model/driver-location.model.js";
import Driver from "./models/Driver-Model/driver.model.js";
import Message from "./models/Driver-Model/Message.js";
import TripLocation from "./models/Driver-Model/trip-location.model.js";

let ioInstance = null;

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
      credentials: true,
    },
  });
  ioInstance = io;

  io.on("connection", (socket) => {
    socket.on("join:trip", ({ tripId }) => {
      if (!tripId) return;
      socket.join(`trip:${tripId}`);
    });

    // Live location updates from drivers
    const handleLocationUpdate = async (payload = {}) => {
      try {
        const { driverId, latitude, longitude, tripId } = payload;
        if (!driverId || typeof latitude !== "number" || typeof longitude !== "number") return;

        // Upsert latest driver location
        await DriverLocation.findOneAndUpdate(
          { driverId },
          { latitude, longitude, updatedAt: new Date() },
          { new: true, upsert: true }
        );
        await Driver.findByIdAndUpdate(driverId, { isOnline: true });

        // Persist trip trace if provided
        if (tripId) {
          await TripLocation.create({ tripId, driverId, latitude, longitude, timestamp: new Date() });
          io.to(`trip:${tripId}`).emit("location:live", { driverId, latitude, longitude, tripId, ts: Date.now() });
        } else {
          io.emit("location:live", { driverId, latitude, longitude, ts: Date.now() });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[socket] location:update error", e.message);
      }
    };
    socket.on("location:update", handleLocationUpdate);
    // Alias event name for clients
    socket.on("update_location", handleLocationUpdate);

    // Realtime chat send
    const handleChatSend = async ({ tripId, senderId, receiverId, text }) => {
      try {
        if (!tripId || !senderId || !text) return;
        const msg = await Message.create({ tripId, senderId, receiverId, text });
        io.to(`trip:${tripId}`).emit("chat:new", msg);
        io.to(`trip:${tripId}`).emit("receive_message", msg);
      } catch (e) {
        console.error("[socket] chat:send error", e.message);
      }
    };
    socket.on("chat:send", handleChatSend);
    // Alias for clients
    socket.on("send_message", handleChatSend);

    // Typing indicator
    socket.on("chat:typing", ({ tripId, from, to, isTyping }) => {
      if (!tripId || !from) return;
      io.to(`trip:${tripId}`).emit("chat:typing", { tripId, from, to, isTyping: !!isTyping });
    });
  });

  return io;
}

export function getIO() {
  if (!ioInstance) throw new Error("Socket.io not initialized");
  return ioInstance;
}
