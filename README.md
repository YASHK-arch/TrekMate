# Trekking Management Application — MERN Edition

A migration of the original Flask + SQLite + Jinja2 application to **MongoDB, Express, React, and Node.js**. The existing Bootstrap-based visual language, colors, typography, responsive layouts, role-based navigation, trek lifecycle, and booking workflow have been carried into the React frontend and Express API. The original image assets and CSS are retained.

## Stack

- **MongoDB + Mongoose** — document persistence for users, admins, trek staff, treks, and bookings
- **Express + Node.js** — REST API, JWT authentication, role authorization, uploads, booking rules
- **React + Vite** — SPA with React Router
- **Bootstrap 5 + Bootstrap Icons + Chart.js** — responsive interface and admin charts

## Run locally

Requirements: Node.js 20+ and MongoDB 7+ (local install or MongoDB Atlas).

1. Start MongoDB locally. Or use Docker:
   ```bash
   docker compose up -d mongodb
   ```
2. Copy the environment template:
   ```bash
   # Windows PowerShell
   Copy-Item server/.env.example server/.env
   # macOS/Linux
   cp server/.env.example server/.env
   ```

   Set `MONGODB_URI` and change `JWT_SECRET` in `server/.env` for your environment.
3. Install workspace dependencies from the project root:
   ```bash
   npm install
   ```
4. Run the API and frontend together:
   ```bash
   npm run dev
   ```
5. Open **http://localhost:5173**. The API health endpoint is **http://localhost:5000/api/health**.

### Default administrator

- Email: `admin@trek.com`
- Password: `admin123`

The server creates this administrator only if that email does not already exist. Change the default credentials before deploying publicly.

## Main flows retained

### Admin

- KPI dashboard, popular-trek and booking-status charts
- Create/edit/delete trek listings, cover-image upload, staff assignment
- Manage users and blacklist/un-blacklist accounts
- Approve/reject/blacklist staff
- View booking records

### Trek staff

- Assigned-treks dashboard and participant list
- Update assigned trek status through `Approved → Open → Started → Completed`
- Completing a trek automatically completes its active bookings
- Staff can only view/update treks assigned to their account

### Trekker

- Register/login, browse treks, filter by location and difficulty
- View trek details and assigned guide
- Book only `Open` treks, prevent duplicate bookings and overbooking
- View active bookings, cancel bookings (slot restored), and view history
- Edit profile

## Notes about the migration

- API authentication uses a signed JWT stored by the browser; the API enforces role checks independently of the UI.
- Passwords are hashed with bcrypt.
- Booking reservations use a conditional MongoDB update so concurrent requests cannot reserve the same final slot.
- Trek images are served from `client/public/static/uploads`. New image uploads retain their extension and are limited to 8 MB.
- The SQLite database from the Flask version is **not automatically imported**. The MongoDB database starts with a default admin account; register new users/staff or import legacy data separately.
- This is a development setup. Before production, use a strong `JWT_SECRET`, configure the correct CORS origin, validate upload content more strictly, and serve the built React app behind HTTPS.

## Build for deployment

```bash
npm run build
npm start --workspace server
```

The frontend build is generated in `client/dist`. Configure your production web server to serve that directory and proxy `/api` requests to the Express server.
