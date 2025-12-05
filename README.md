## Research Portal
Comprehensive platform for research paper submissions, reviews, and coordinator operations. Role-based dashboards for Authors, Reviewers, and Coordinators. Frontend: Next.js (App Router), TypeScript, Tailwind. Backend: Express + TypeScript, MongoDB, JWT. Deployed on Vercel (frontend) and Render (backend).

### Live URLs
- Frontend: https://research-portal-srmap.vercel.app
- Backend API: https://research-portal-srmap.onrender.com/api
- File base (uploads): https://research-portal-srmap.onrender.com

### Features (by role)
- Auth (all): JWT login/register, protected routes.
- Author: submit papers (PDF upload), view own submissions, status tracking.
- Reviewer: view assigned papers, open/download PDFs, submit reviews with comments/insights.
- Coordinator: create/manage events, view event submissions, export accepted papers to Excel, reviewer reminders, stats overview, mock assignments endpoint.
- Shared: file uploads served from backend `/uploads/papers`; stats endpoints for summaries and per-event breakdowns.

### Architecture Overview
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, Axios API client, Zustand stores; protected and role-aware screens.
- Backend: Express + TypeScript, MongoDB (Mongoose), JWT (access/refresh), multer for uploads, pino logging, helmet/cors/compression.
- Deploy: Frontend on Vercel; Backend on Render.

### Folder Structure (high level)
- `frontend/` — Next.js app  
  - `src/app/` — routes/pages (login, register, dashboard: author/reviewer/coordinator)  
  - `src/components/` — Navbar, Sidebar, UI components  
  - `src/lib/` — API client, auth helpers, constants, utils  
  - `src/store/` — Zustand stores (event, paper, user)  
  - `src/types/` — TypeScript types  
- `research-backend/` — Express API  
  - `src/app.ts`, `src/index.ts` — server bootstrap  
  - `src/routes/` — auth, paper, review, event, admin, health  
  - `src/models/` — user, paper, review, event (Mongoose)  
  - `src/middlewares/` — auth middleware  
  - `src/utils/` — JWT tokens  
  - `src/config/env.ts` — env loader  
  - `uploads/` — uploaded PDFs (served statically)  

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB instance (local or Atlas)

### Environment Variables
Frontend (`frontend/.env.local`):
- `NEXT_PUBLIC_API_BASE_URL` — e.g. `https://research-portal-srmap.onrender.com/api`
- `NEXT_PUBLIC_FILE_BASE` — e.g. `https://research-portal-srmap.onrender.com`

Backend (`research-backend/.env` or Render env):
- `PORT` — e.g. `8080` (Render sets dynamically)
- `CLIENT_ORIGIN` — e.g. `https://research-portal-srmap.vercel.app`
- `MONGO_URI` — MongoDB connection string
- `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES` — e.g. `15m`
- `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES` — e.g. `7d`

### Local Setup
1) Backend
```bash
cd research-backend
npm install
# create .env with the backend variables above
npm run build
npm start          # or: npm run dev
```
2) Frontend
```bash
cd frontend
npm install
# create .env.local with the frontend variables above
npm run dev        # or: npm run build && npm start
```

### Deployment
- Backend (Render):
  - Build: `npm run build`
  - Start: `npm start`
  - Env: set `CLIENT_ORIGIN`, `MONGO_URI`, JWT secrets/expiries, `PORT` (Render provided)
- Frontend (Vercel):
  - Env: set `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_FILE_BASE`
  - Redeploy to apply env changes

### File Uploads
- Stored under `research-backend/uploads` and served at `/uploads/...` by the backend.
- Frontend builds links as `NEXT_PUBLIC_FILE_BASE + fileUrl` (e.g. `https://research-portal-srmap.onrender.com/uploads/papers/<file>.pdf`).

### Key API Notes
- Base: `https://research-portal-srmap.onrender.com/api`
- Auth: `/auth/login`, `/auth/register`
- Papers: `/paper/upload`, `/paper/my`, `/paper/:paperId`
- Reviews: `/review/assigned`, `/review/:paperId`
- Events: `/events`, `/events/:eventId/submissions`, `/events/:eventId/accepted`, `/events/:eventId/accepted.xlsx`, `/events/:eventId/assign` (mock)
- Admin/Stats: `/admin/stats`, `/admin/stats/event/:eventId`, `/admin/reviewers/reminders`

### Testing (manual checklist)
- Auth: register, login, logout.
- Author: submit paper (PDF), view submissions, open PDF link.
- Reviewer: assigned list, open PDF, submit review.
- Coordinator: create event, view submissions, download accepted.xlsx, view reminders/stats.
- CORS: API calls succeed from frontend origin.

### Roadmap / Notes
- Assignments endpoint currently mock (logs request); persist when assignment model is added.
- Consider moving uploads to persistent object storage for production durability.

### Credits
- Authored by **Harsh Singh**
- In association with **Dr. Manikandan**
