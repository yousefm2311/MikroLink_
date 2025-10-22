const log = (msg) => {
  const el = document.getElementById("log");
  const time = new Date().toLocaleTimeString();
  el.innerHTML += `<div>[${time}] ${msg}</div>`;
  el.scrollTop = el.scrollHeight;
};

const socket = io({ transports: ["websocket"] });

socket.on("connect", () => log("connected: " + socket.id));
socket.on("disconnect", () => log("disconnected"));
socket.on("location:live", (data) =>
  log("location:live " + JSON.stringify(data))
);
socket.on("chat:new", (m) => log("chat:new " + JSON.stringify(m)));
socket.on("chat:typing", (p) => log("chat:typing " + JSON.stringify(p)));

function joinTrip() {
  const tripId = document.getElementById("tripId").value.trim();
  if (!tripId) return alert("enter tripId");
  socket.emit("join:trip", { tripId });
  log("joined trip room trip:" + tripId);
}

function sendLocation() {
  const driverId = document.getElementById("driverId").value.trim();
  const tripId = document.getElementById("tripId").value.trim();
  const latitude = parseFloat(document.getElementById("lat").value);
  const longitude = parseFloat(document.getElementById("lng").value);
  if (!driverId) return alert("enter driverId");
  socket.emit("location:update", {
    driverId,
    latitude,
    longitude,
    tripId: tripId || undefined,
  });
  log("sent location:update");
}

function sendChat() {
  const tripId = document.getElementById("tripId").value.trim();
  const senderId = document.getElementById("driverId").value.trim();
  const text = document.getElementById("chatText").value.trim();
  if (!tripId || !senderId || !text)
    return alert("tripId, senderId and text are required");
  socket.emit("chat:send", { tripId, senderId, text });
  log("sent chat:send");
}

function typing(isTyping) {
  const tripId = document.getElementById("tripId").value.trim();
  const from = document.getElementById("driverId").value.trim();
  socket.emit("chat:typing", { tripId, from, isTyping });
}

// ✅ اربط كل الأزرار بالأحداث (بدون inline onclick)
document.getElementById("joinTrip").addEventListener("click", joinTrip);
document.getElementById("sendLocation").addEventListener("click", sendLocation);
document.getElementById("sendChat").addEventListener("click", sendChat);
document
  .getElementById("typingOn")
  .addEventListener("click", () => typing(true));
document
  .getElementById("typingOff")
  .addEventListener("click", () => typing(false));
