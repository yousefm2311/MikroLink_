# MikroLink Backend – REST API Reference

This document provides a complete, production‑grade reference for MikroLink’s REST APIs and realtime events, including endpoints, request/response contracts, authentication, error handling, and how to run the backend locally.

---

## Overview

- Stack: Node.js (ESM), Express, MongoDB (Mongoose), Socket.io
- Domains: Driver APIs and User APIs (+ shared realtime features)
- Base URL (local): `http://localhost:5000`
- Authentication: JWT Bearer (Access + Refresh)
- Rate limiting: global limiter (configurable)
- Static assets: `GET /uploads/...` (driver documents, images)
- Realtime: Socket.io at `ws://localhost:5000` (see Realtime section)

Environment variables are shown in `.env.example` (PORT, MONGO_URI, JWT_SECRET, etc.).

---

## Running Locally

1. Requirements: Node 18+ (or LTS), MongoDB running locally or via URI
2. Copy `.env.example` → `.env` and set values
3. Install deps: `npm install`
4. Start dev: `npm run dev` (or `npm start`)
5. Verify: `GET http://localhost:5000/public/socket-test.html` opens Socket test page

---

## Conventions

- Content‑Type: `application/json`
- Auth header: `Authorization: Bearer <ACCESS_TOKEN>` when required
- Standard responses:
  - Success: `{ success: true, message: string, data?: any }`
  - Error: `{ message: string, code?: string, details?: any[] }`
- Validation: `express-validator`; validation errors included in `details`
- Date/time: ISO 8601 (UTC) unless stated otherwise

---

## Authentication Model

- Access token (short‑lived): `15m`
- Refresh token (long‑lived): `30d`
- Drivers: `/api/driver/*`
- Users: `/api/user/*`

Common flows for both roles:
1. Signup → verify email (link)
2. Login → receive `accessToken` + `refreshToken`
3. Authenticated routes → send `Authorization: Bearer <accessToken>`
4. When access token expires → use `/refresh` with refresh token to get new access token
5. Logout → invalidates stored refresh token

---

## Driver API

Base: `/api` (requires auth for most routes unless noted)

### Auth – `/api/driver`

- POST `/signup` – create driver (email verification sent)
  - Body: `{ fullName, phone, email, password }`
  - 201 Created → `{ success, message }`

- POST `/resend-verification` – resend email verification
  - Body: `{ email }`

- GET `/verify/:token` – verify email via link (HTML response)

- POST `/login` – login (email/password)
  - Body: `{ email, password }`
  - 200 OK → `{ success, message, data: { accessToken, refreshToken, driver } }`

- POST `/forgot-password` – request OTP code
  - Body: `{ email }`

- POST `/verify-reset-code` – verify OTP
  - Body: `{ email, code }`

- POST `/reset-password` – set new password
  - Body: `{ email, code, newPassword }`

- POST `/change-password` (auth)
  - Body: `{ currentPassword, newPassword }`

- POST `/refresh` – new access token
  - Body: `{ refreshToken }`

- POST `/logout` – revoke refresh token
  - Body: `{ refreshToken }`

### Profile – `/api/profile` (auth)

- GET `/` – fetch profile (sans password)
- PUT `/` – update profile
  - Body: `{ fullName?, phone? }`
- POST `/upload` – upload documents (multipart/form‑data)
  - Fields: `idFront`, `idBack`, `license`, `carPhoto`, `profilePhoto`
  - Limits: 5MB per file; images only

### Vehicle – `/api/vehicle` (auth)

- GET `/` – fetch driver vehicle
- POST `/` – create/update vehicle
  - Body: `{ plateNumber?, model?, fuelLevel?, odometer?, nextOilChange? }`

### Maintenance – `/api/maintenance` (auth)

- POST `/` – add a maintenance record
  - Body: `{ type, date?, odometer?, cost?, notes? }`
- GET `/` – list maintenance history (desc by date)

### Oil – `/api/oil` (auth)

- POST `/update` – update oil stats
  - Body: `{ odometer, nextOilChange }`
- GET `/` – fetch oil info + computed `distanceSinceChange`, `remaining`

### Reminder – `/api/reminder` (auth)

- POST `/` – create reminder `{ title, details?, dueDate? }`
- GET `/` – list reminders (asc by dueDate)
- PUT `/:id/read` – mark reminder as read

### Trip – `/api/trip` (auth)

- GET `/` – list trips (desc by startedAt)
- POST `/start` – start a trip
  - Body: `{ passengerName, pickupLocation, dropoffLocation, fare?, distance? }`
- POST `/:id/complete` – complete a trip
- GET `/current` – get in‑progress trip (or `null`)
- POST `/:id/cancel` – cancel a trip
- GET `/history` – list completed trips (desc by completedAt)

### Earnings – `/api/earnings` (auth)

- GET `/today` – totals for today `{ total, count }`
- GET `/month` – totals for current month `{ total, count }`

### Rating – `/api/rating` (auth)

- GET `/` – list ratings with `{ average, count, ratings }`

### Notification – `/api/notification` (auth)

- GET `/` – list platform notifications (desc by createdAt)

### Status – `/api/status` (auth)

- PUT `/toggle` – toggle `isOnline` (returns new state)

### Location – `/api/location` (auth unless public endpoint noted)

- POST `/live` – upsert current driver coordinates
  - Body: `{ latitude: number, longitude: number }`
  - Side effects: sets driver `isOnline = true`
- GET `/live` – get last live location (if any)
- GET `/available` – public: find nearby online drivers
  - Query: `latitude`, `longitude`, `vehicleType?`
  - Returns: sorted by `distanceKm`, ETA calculated
- POST `/` – add a trip location point
  - Body: `{ tripId, latitude, longitude }`
- GET `/:tripId` – all locations for a trip

### Summary – `/api/summary` (auth)

- GET `/` – totals `{ totalTrips, totalEarnings, avgRating }`
- GET `/weekly` – last 7 days summary `{ totalTrips, totalEarnings, avgRating, totalFuel, from, to }`

### Support – `/api/support` (auth)

- POST `/` – create support message `{ message }`
- GET `/` – list support messages by driver

### Fuel – `/api/fuel` (auth)

- POST `/` – add fuel record `{ liters, cost, odometer?, stationName? }`
- GET `/` – list fuel logs
- GET `/summary` – aggregated fuel stats `{ totalLiters, totalCost, averagePrice, recordsCount }`

### Chat History – `/api/chat` (auth)

- GET `/:tripId` – previous chat messages for the trip (asc by timestamp)

---

## User API

Base: `/api/user` (and sub‑paths)

### Auth – `/api/user`

- POST `/signup`, POST `/resend-verification`, GET `/verify/:token`
- POST `/login`, POST `/forgot-password`, POST `/verify-reset-code`, POST `/reset-password`
- POST `/change-password` (auth), POST `/refresh`, POST `/logout`

### Profiles – `/api/user/profile` (auth)

- Typical: GET, PUT (fields vary by implementation; see code for exact shape)

### Trips – `/api/user/trip` and `/api/user/trips` (auth)

- Trip creation/acceptance/summary endpoints (see route files `routes/userTrip.js`)

### Chat – `/api/user/chat` (auth)

- Fetch chat history by trip/user context (see `routes/userChat.js`)

### Location – `/api/user/location` (auth)

- User location reporting/retrieval for consumer side

### Favorites – `/api/user/favorites` (auth)

- Manage user favorites (drivers/places)

### Notifications – `/api/user/notifications` (auth)

- Notification listing/ack

### Wallet – `/api/user/wallet` (auth)

- Balance, transactions, top‑ups (as implemented)

### Support – `/api/user/support` (auth)

- Submit and fetch user support messages

### Rate App – `/api/user/rate-app` (auth)

- Submit user app rating

### Summary – `/api/user/summary` (auth)

- Dashboard stats for user

> Note: The exact user endpoints may include additional routes and parameters; see route files under `routes/` for the full list.

---

## Realtime (Socket.io)

- Client connects to `ws://localhost:5000`
- Test page: `GET /public/socket-test.html`

Events:

### Rooms
- `join:trip` → `{ tripId }` → joins room `trip:<tripId>`

### Live Location
- `location:update` → `{ driverId, latitude, longitude, tripId? }`
  - Persists latest driver location
  - If `tripId` present: appends to `TripLocation` and emits to `trip:<tripId>`
- Server emits `location:live` with `{ driverId, latitude, longitude, tripId?, ts }`

### Chat
- `chat:send` → `{ tripId, senderId, receiverId?, text }`
  - Persists in `Message` and emits `chat:new` to `trip:<tripId>`
- `chat:new` (server → clients in room) → full message object
- `chat:typing` → `{ tripId, from, to?, isTyping }` broadcast to room

---

## Errors & Validation

- All validation errors return 400 with `details: [{ field, msg }]`
- Typical auth errors: 401 (missing/invalid token), 403 (unverified/forbidden), 404 (not found)
- Server errors: 500 with generic message in production

---

## Rate Limiting & CORS

- Rate limit defaults: 1000 requests per 15 minutes globally (configurable via `RATE_LIMIT_MAX`)
- CORS: `CORS_ORIGIN` env supports single origin or comma‑separated list

---

## File Uploads

- Uploads directory: `/uploads`
- Profile documents upload: `POST /api/profile/upload` (driver)
- Limits: 5MB per file, images only (PNG/JPEG)

---

## Environment Variables

Key variables (see `.env.example`):

- `PORT`, `APP_URL`
- `MONGO_URI`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `EMAIL_USER`, `EMAIL_PASS`
- `CORS_ORIGIN`, `RATE_LIMIT_MAX`

---

## Example Requests

### Driver Login

POST `/api/driver/login`

Body:
```json
{ "email": "driver@example.com", "password": "pass1234" }
```

Response:
```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح.",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "driver": { "_id": "...", "email": "driver@example.com", "verified": true }
  }
}
```

### Live Location (Socket.io, JS)

```js
const socket = io("http://localhost:5000", { transports: ["websocket"] });
socket.emit("join:trip", { tripId: "<tripId>" });
socket.emit("location:update", { driverId: "<driverId>", latitude: 30.0, longitude: 31.0, tripId: "<tripId>" });
socket.on("location:live", (p) => console.log("location", p));
```

---

## Notes

- For the most up‑to‑date list of user endpoints, see route files under `routes/*.js`.
- Postman collections are available in `docs/*.postman_collection.json`.

