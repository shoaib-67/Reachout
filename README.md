# ReachOut

ReachOut is a React + Vite community support platform with:

- Human Lost & Found
- Goods Lost & Found
- Blood Donation
- Login and Register (MySQL-backed authentication API)


## Features

- **Home service selection** with quick navigation
- **Human Lost & Found**
  - Search demo missing-person cases
  - Post human lost/found reports with preview
- **Goods Lost & Found**
  - Type selection UI for human vs goods flow
- **Blood Donation**
  - Donor registration with schedule
  - Donor search by blood group and area
  - Emergency blood request creation
  - Donor eligibility check + 3-month rest rule hint
  - Request status lifecycle (`Open`, `Accepted`, `Completed`, `Cancelled`, `Expired`)
  - Auto-expiry countdown and notification feed
  - Local storage persistence for donor/request data

## Tech Stack

- React
- Vite
- Plain CSS (`frontend/styles.css`)
- Node.js + Express (`backend`)
- MySQL (`mysql2`)


## Prerequisites

- Node.js 18+ (recommended)
- npm

## How to Run (Development)

### 1) Backend (MySQL API)

```bash
cd backend
npm install
npm run start
```

Before starting backend:
- Copy `backend/.env.example` to `backend/.env`
- Update DB credentials
- Run `backend/schema.sql` in MySQL

Backend default: `http://localhost:4000`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default: `http://localhost:5173`


## Notes

- Routing is handled in `frontend/src/App.jsx` using path detection and browser history.
- Auth API endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- Some blood donation data is saved in browser local storage for demo persistence.
