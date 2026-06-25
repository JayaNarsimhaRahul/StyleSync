# StyleSync

A full-stack salon booking platform. Customers discover salons, book appointments in real-time, and manage their history. Salon owners get a full management dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 (Vite) + TailwindCSS 3 + React Query + React Hook Form + Zod |
| Backend | Node.js + Express 5 + Mongoose (MongoDB) |
| Auth | JWT (access + refresh tokens) + bcrypt + httpOnly cookies |
| Images | Multer + Cloudinary |
| Payments | Razorpay (Phase 3) |
| Email | Nodemailer (Phase 3) |

---

## Project Structure

```
StyleSync/
├── backend/
│   ├── server.js           # Entry point — DB connect → HTTP server
│   ├── .env.example        # Environment variable template
│   └── src/
│       ├── app.js          # Express app, middleware, routes
│       ├── config/
│       │   └── db.js       # MongoDB connection
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── salonController.js
│       │   ├── serviceController.js
│       │   ├── staffController.js
│       │   ├── availabilityController.js
│       │   ├── bookingController.js
│       │   ├── reviewController.js
│       │   └── ownerController.js
│       ├── middleware/
│       │   ├── auth.js         # protect + restrictTo
│       │   ├── errorHandler.js
│       │   └── upload.js       # Multer + Cloudinary
│       ├── models/
│       │   ├── User.js
│       │   ├── Salon.js
│       │   ├── Service.js
│       │   ├── Staff.js
│       │   ├── Booking.js
│       │   └── Review.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── salonRoutes.js
│       │   ├── serviceRoutes.js
│       │   ├── staffRoutes.js
│       │   ├── bookingRoutes.js
│       │   └── ownerRoutes.js
│       └── utils/
│           ├── AppError.js
│           ├── tokenUtils.js
│           └── slotEngine.js   ⚠️ Core algorithm — see below
└── frontend/
    ├── index.html
    ├── vite.config.js      # Proxy: /api → localhost:5000
    └── src/
        ├── App.jsx
        ├── api/
        │   ├── axios.js    # Axios instance + auto-refresh interceptor
        │   └── index.js    # All API functions
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ToastContext.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── SalonListing.jsx
        │   ├── SalonDetail.jsx
        │   ├── BookingFlow.jsx     # Multi-step wizard
        │   ├── CustomerDashboard.jsx
        │   └── OwnerDashboard.jsx  # With sub-routes
        ├── components/
        │   ├── Navbar.jsx
        │   └── Footer.jsx
        └── routes/
            └── ProtectedRoute.jsx
```

---

## Setup

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in the values:

```bash
cp backend/.env.example backend/.env
```

Required variables:

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens (use a long random string) |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (different from access) |
| `JWT_ACCESS_EXPIRES` | Access token expiry (default: `15m`) |
| `JWT_REFRESH_EXPIRES` | Refresh token expiry (default: `7d`) |
| `CLIENT_URL` | Frontend URL for CORS (default: `http://localhost:5173`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `RAZORPAY_KEY_ID` | Razorpay key (Phase 3) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret (Phase 3) |
| `EMAIL_HOST` | SMTP host (Phase 3) |
| `EMAIL_USER` | SMTP email (Phase 3) |
| `EMAIL_PASS` | SMTP password (Phase 3) |

### 3. Run Locally

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Visit `http://localhost:5173`

---

## ⚠️ Slot Availability Engine

The core booking algorithm lives in [`backend/src/utils/slotEngine.js`](./backend/src/utils/slotEngine.js).

**How it works:**

1. Reads the salon's `openingHours` for the requested weekday
2. Clamps against the specific staff member's `workingHours` for that day
3. Generates candidate slots on a 30-minute grid
4. Filters out:
   - Slots that end after the effective close time
   - Slots that conflict with any existing **non-cancelled** booking for that staff+date (pending and confirmed bookings block slots)
   - Slots in the past (with a 30-minute buffer for today's bookings)
5. Returns the surviving `["HH:MM", ...]` array

**Double-booking prevention:** The `createBooking` controller re-runs the slot engine at write time before saving, so even if two customers hit the API simultaneously, only one will succeed.

---

## API Reference

### Auth
```
POST   /api/auth/register    { name, email, password, role }
POST   /api/auth/login       { email, password }
POST   /api/auth/refresh     (reads httpOnly cookie)
POST   /api/auth/logout      🔒
GET    /api/auth/me          🔒
```

### Salons
```
GET    /api/salons                              ?search&city&category&minRating
GET    /api/salons/:id
POST   /api/salons                             🔒 owner
PUT    /api/salons/:id                         🔒 owner
POST   /api/salons/:id/images                  🔒 owner (multipart)
DELETE /api/salons/:id/images                  🔒 owner
GET    /api/salons/:id/services
POST   /api/salons/:id/services                🔒 owner
GET    /api/salons/:id/staff
POST   /api/salons/:id/staff                   🔒 owner
GET    /api/salons/:id/availability            ?serviceId&staffId&date
GET    /api/salons/:id/reviews
GET    /api/salons/:id/bookings                🔒 owner
```

### Services
```
PUT    /api/services/:id                       🔒 owner
DELETE /api/services/:id                       🔒 owner
```

### Staff
```
PUT    /api/staff/:id                          🔒 owner
DELETE /api/staff/:id                          🔒 owner
```

### Bookings
```
POST   /api/bookings                           🔒 customer
GET    /api/bookings/me                        🔒 customer
PATCH  /api/bookings/:id/cancel                🔒 customer or owner
PATCH  /api/bookings/:id/reschedule            🔒 customer
POST   /api/bookings/:id/review                🔒 customer (completed only)
```

### Owner
```
GET    /api/owner/my-salon                     🔒 owner
GET    /api/owner/analytics/:salonId           🔒 owner
```

---

## Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import in Vercel → root directory: `frontend`
3. Set `VITE_API_URL` to your Render backend URL

### Backend (Render)
1. Create a new Web Service → root directory: `backend`
2. Build command: `npm install`
3. Start command: `npm start`
4. Add all environment variables

### Database (MongoDB Atlas)
1. Create a free M0 cluster
2. Add your Render IP to the allowlist (or allow all: `0.0.0.0/0`)
3. Copy the connection string to `MONGO_URI`

---

## Phase Roadmap

- ✅ **Phase 1**: Auth, models, frontend skeleton
- ✅ **Phase 2**: Salon/Service/Staff CRUD, slot engine, booking flow, owner dashboard
- ⏳ **Phase 3**: Razorpay payments, Nodemailer emails, node-cron reminders, analytics charts
- ⏳ **Phase 4**: Staff login, SMS (Twilio), loyalty points, super admin
