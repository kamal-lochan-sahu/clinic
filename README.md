# MediManage

Clinic management system for small and mid-size clinics: patient records, appointments with live queue, OPD consultation with prescriptions, lab tests, medicine inventory, billing, staff, expenses and analytics.

## Features

- Multi-role auth (owner, doctor, receptionist, nurse) with JWT access and refresh tokens
- Patient registry with allergies, chronic conditions, history and search
- Appointment booking with slot availability and token queue
- OPD consultation, vitals and prescription PDF generation
- Lab test orders and report upload
- Medicine inventory with low-stock and expiry tracking
- Billing with receipts (PDF), partial payments and day summary
- Staff, salary and expense tracking
- Dashboard and analytics (revenue, new patients, top diagnoses)
- Automated WhatsApp/email reminders (Twilio, SMTP) via cron jobs

## Tech stack

- Backend: Node.js, Express, MongoDB (Mongoose), Redis (optional), node-cron, pdfkit, Cloudinary, Twilio, Nodemailer
- Frontend: React 18, Vite, Tailwind CSS, React Query, Zustand, React Hook Form, Zod, Recharts

## Project structure

    backend/    Express API (src/controllers, models, routes, services, jobs, middleware, utils)
    frontend/   React app (src/pages, components, hooks, services, store, utils)
    docs/       Project status, decisions and roadmap

## Getting started

Requirements: Node.js 18+, a MongoDB instance (local or Atlas).

    # backend
    cd backend
    cp .env.example .env      # fill in values
    npm install
    npm run dev               # http://localhost:5000  (health: /health)

    # frontend (new terminal)
    cd frontend
    cp .env.example .env
    npm install
    npm run dev               # http://localhost:3000  (proxies /api to :5000)

Redis, Cloudinary, SMTP and Twilio are optional for local development; related features are skipped when not configured (PDF upload needs Cloudinary).

## Scripts

- backend: `npm run dev` (nodemon), `npm start`
- frontend: `npm run dev`, `npm run build`, `npm run preview`

## Deployment

- Frontend: Vercel (SPA rewrite in `frontend/vercel.json`), set `VITE_API_URL` to the API URL.
- Backend: any Node host (e.g. Render). Set all variables from `backend/.env.example`; `CLIENT_URL` must match the frontend origin. In production auth cookies use `SameSite=None; Secure`.

## Status

See [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) for known issues and the roadmap.
