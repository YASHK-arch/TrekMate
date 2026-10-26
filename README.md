# Trekking Management Application — MERN Edition

<img width="1166" height="664" alt="image" src="https://github.com/user-attachments/assets/487c344c-8bff-4332-bb76-25c5c8a9acd0" />


A migration of the original Flask + SQLite + Jinja2 application to **MongoDB, Express, React, and Node.js**. The existing Bootstrap-based visual language, colors, typography, responsive layouts, role-based navigation, trek lifecycle, and booking workflow have been carried into the React frontend and Express API. The original image assets and CSS are retained.

## Stack

- **MongoDB + Mongoose** — document persistence for users, admins, trek staff, treks, and bookings
- **Express + Node.js** — REST API, JWT authentication, role authorization, uploads, booking rules
- **Cloudinary** — permanent storage and delivery for images uploaded by admins
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

   Set `MONGODB_URI` and change `JWT_SECRET` in `server/.env` for your environment. Add your Cloudinary cloud name, API key, and API secret to enable admin image uploads.
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

- Register/login, browse treks, filter by region and difficulty
- View trek details and assigned guide
- Book only `Open` treks, prevent duplicate bookings and overbooking
- View active bookings, cancel bookings (slot restored), and view history
- Edit profile

## Notes about the migration

- API authentication uses a signed JWT stored by the browser; the API enforces role checks independently of the UI.
- Passwords are hashed with bcrypt.
- Booking reservations use a conditional MongoDB update so concurrent requests cannot reserve the same final slot.
- Seeded Commons photos are served locally from `client/public/static/uploads`. Admin uploads are received by Multer, stored in Cloudinary, and their secure image URLs are saved in MongoDB. Uploads are limited to 8 MB.
- Seeded trek images are bundled locally from Wikimedia Commons, so they do not depend on remote image hosts at runtime. Existing records with remote image URLs are migrated to the corresponding local photo when the API starts.
- Wikimedia Commons photo credits and license details:
  - [Everest Base Camp Trek with Hikingbees](https://commons.wikimedia.org/wiki/File:Everest_Base_Camp_Trek_with_Hikingbees.jpg), Campbell Hillary, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)
  - [Yak on the Annapurna Circuit](https://commons.wikimedia.org/wiki/File:Bos_grunniens_at_Letdar_on_Annapurna_Circuit.jpg), travelwayoflife, [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0)
  - [Deoria Tal and the Himalaya](https://commons.wikimedia.org/wiki/File:Reflection_of_himalaya_on_deoria_tal.jpg), Rajborah123, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)
  - [Nilgiri hills](https://commons.wikimedia.org/wiki/File:Fields_TR_Bazar_NH-181_Nilgiris_Aug25_A7CR_07388-HDR.jpg), Timothy A. Gonsalves, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)
  - [Mount Fuji from the trail to Mount Sengenrei](https://commons.wikimedia.org/wiki/File:Mount_Fuji_%40_Trail_to_Mount_Sengenrei_%40_Hike_to_Mount_Sengenrei_%26_Mount_Mito_(13974273260).jpg), Guilhem Vellut, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0)
  - [Rice terraces in Sapa](https://commons.wikimedia.org/wiki/File:Rice_terraces_in_Sapa,_Vietnam.jpg), Eerin25, [CC0](https://creativecommons.org/publicdomain/zero/1.0/)
  - [Tian Shan Mountains](https://commons.wikimedia.org/wiki/File:Kyrgyzstan,_Tian_Shan_Mountains_(14244010047).jpg), Thomas Depenbusch, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0)
  - [Paro Taktsang trail](https://commons.wikimedia.org/wiki/File:Paro_Taktsang_trail_08.jpg), Bernard Gagnon, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)
  - [Kirigalpotta Mountain](https://commons.wikimedia.org/wiki/File:Kirigalpotta_Mountain_(2nd_highest),_SriLanka.jpg), Chamrith, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)
  - [Great Wall at Badaling](https://commons.wikimedia.org/wiki/File:View_east_from_Great_Wall_of_China_at_Badaling.jpg), Daniel Case, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0)
- The SQLite database from the Flask version is **not automatically imported**. The MongoDB database starts with a default admin account; register new users/staff or import legacy data separately.
- This is a development setup. Before production, use a strong `JWT_SECRET`, configure the correct CORS origin, validate upload content more strictly, and serve the built React app behind HTTPS.

## Build for deployment

```bash
npm run build
npm start --workspace server
```

The frontend build is generated in `client/dist`. Configure your production web server to serve that directory and proxy `/api` requests to the Express server.
