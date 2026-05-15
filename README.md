# ReachOut

ReachOut is a React + Vite community support frontend with three main service flows:

- Human Lost & Found
- Goods Lost & Found
- Blood Donation


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


## Prerequisites

- Node.js 18+ (recommended)
- npm

## How to Run (Development)

From project root:

```bash
cd frontend
npm install
npm run dev
```

Vite will start a local dev server and print the URL (usually `http://localhost:5173`).


## Notes

- Routing is handled in `frontend/src/App.jsx` using path detection and browser history.
- Some blood donation data is saved in browser local storage for demo persistence.
