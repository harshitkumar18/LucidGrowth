## Email Analyzer - Architecture & Flow

This document explains how the system works end-to-end across backend and frontend, the data model, processing pipeline, API surface, environment variables, and deployment/runtime considerations.

### High-level Overview

- Backend: NestJS service that connects to IMAP, parses emails, extracts the receiving chain (hop-by-hop), detects ESP type, persists results to MongoDB, and exposes REST APIs under `/api`.
- Frontend: React single-page app (deployed as static assets) that calls the backend APIs, shows system status (test address/subject, IMAP auth), lists emails, and renders a tabular receiving chain with per-hop delay/protocol/time.
- Hosting: Backend on Railway (long‑running Node process). Frontend on Vercel with a rewrite that proxies `/api/*` to the Railway backend.

### Key Runtime Flows

1) Test/seed info generation
   - Backend exposes the configured `TEST_EMAIL_ADDRESS` and `TEST_EMAIL_SUBJECT` via `GET /api/emails/status`.
   - You send a test email to that address using the subject to correlate.

2) Email ingestion (IMAP)
   - `backend/src/email/email.service.ts` creates an IMAP connection using `IMAP_HOST/PORT/USER/PASS`.
   - The service watches the inbox for new mail and periodically processes unseen messages.
   - Each message is parsed with `mailparser` to extract headers, body, and metadata.

3) Analysis pipeline
   - `backend/src/email/email-analysis.service.ts` runs the analysis:
     - Parse all `Received` headers into structured hops: from/by/with/id/for/date/ip.
     - Compute hop delays and infer protocol.
     - Detect ESP using heuristics across `Received`, `Message-ID`, `Return-Path`, and `X-*` headers.
     - Fallback classification for custom/on‑prem domains.
   - Results are saved in MongoDB using `Email` schema (`backend/src/database/schemas/email.schema.ts`).

4) API exposure
   - `backend/src/email/email.controller.ts` exposes:
     - `GET /api/emails` → list analyzed emails
     - `GET /api/emails/:id` → single email by Mongo `_id`
     - `GET /api/emails/message/:messageId` → by Message‑ID
     - `GET /api/emails/status` → system status (counts, test address/subject, IMAP status)
     - `POST /api/emails/process` → manual trigger (optional)

5) Frontend consumption
   - The React app fetches from `/api` (same‑origin). On Vercel, `frontend/vercel.json` rewrites `/api/*` → Railway backend URL to avoid CORS.
   - Views:
     - System Status card (counts, test address/subject)
     - Email list with ESP badge and confidence
     - Email detail with a table for receiving chain: `#`, `Delay`, `From`, `To`, `Protocol`, `Time received`

### Request/Response Flow

Frontend (browser) → Vercel (static) → Vercel rewrite `/api/*` → Railway (NestJS) → MongoDB Atlas

- Example call: `GET https://<frontend-domain>/api/emails/status`
  - Vercel forwards to `https://<railway-domain>/api/emails/status`
  - NestJS responds with JSON like counts, test email, IMAP auth
  - Frontend renders cards/counters

### Data Model (simplified)

Email document fields (selected):
- `_id`: string
- `subject`: string
- `from`: string
- `to`: string
- `date`: Date
- `messageId`: string
- `receivingChain`: Array<Hop>
  - Hop: `{ from?, by?, to?, with?, id?, for?, helo?, ip?, protocol?, timestamp?, delayMs?, delayHuman? }`
- `espType`: string (e.g., Gmail, Outlook, SES, Custom)
- `espDetails`: `{ provider, confidence, reasons[] }`
- `status`: `processed` | `pending` | `error`
- `createdAt`, `updatedAt`

### Environment Variables

Backend (Railway):
- `MONGODB_URI` → MongoDB Atlas SRV URL
- `IMAP_HOST`, `IMAP_PORT`, `IMAP_USER`, `IMAP_PASS`, `IMAP_TLS`
- `TEST_EMAIL_ADDRESS`, `TEST_EMAIL_SUBJECT`
- `PORT` (defaults to 3001) – app listens on this port
- `NODE_ENV` = `production`
- `CORS_ORIGIN` → comma‑separated allowed origins (not required when using Vercel rewrite)

Frontend (Vercel):
- Preferred: no variable; the app calls `/api` and relies on `vercel.json` rewrite.
- Optional: `REACT_APP_API_URL` to override (e.g., local dev).

### CORS & Rewrites

- Production: Frontend calls same‑origin `/api`. `frontend/vercel.json` contains:
  - A rewrite: `/api/(.*)` → `https://<railway-domain>/api/$1`.
  - Root route → `index.html` for SPA.
- With this design, CORS is avoided; no need to set `CORS_ORIGIN` unless you are calling the Railway domain directly from the browser.

### Health & Monitoring

- Suggested health path: `/api/emails/status` returning counts and `imapStatus`.
- Railway health check can target port `3001` and path `/api/emails/status`.
- Logs:
  - IMAP connection/auth state
  - Processed email counts
  - Errors while parsing/storing

### Local Development

Backend:
```
npm run backend:dev
```
Frontend (React dev server via webpack):
```
cd frontend
npm install
npm run dev
```
- Local API base: set `REACT_APP_API_URL=http://localhost:3001/api` or update the dev proxy to point to your backend instance.

### Deployment

- Backend on Railway (long‑running): install/build/start using `--prefix backend` overrides.
- Frontend on Vercel (static): deploy `frontend`, with rewrite to backend.

Checklist:
1. Railway env vars configured and app logs show: `Email Analyzer Backend running on port 3001`.
2. Verify `https://<railway-domain>/api/emails/status` responds. Example: [`status`](https://lucidgrowth-production.up.railway.app/api/emails/status).
3. Vercel has rewrite for `/api/*` to Railway and SPA catch‑all to `index.html`.
4. Frontend loads at `https://<vercel-domain>/` and calls `/api/*` successfully.

### Files of Interest

- Backend
  - `backend/src/email/email.service.ts` → IMAP connect/monitor/process
  - `backend/src/email/email-analysis.service.ts` → headers parsing, hop delays, ESP detection
  - `backend/src/email/email.controller.ts` → API routes
  - `backend/src/main.ts` → bootstrap, CORS, global prefix, listen
  - `backend/src/database/schemas/email.schema.ts` → Mongoose schema

- Frontend
  - `frontend/src/services/api.ts` → API client (uses `/api` or `REACT_APP_API_URL`)
  - `frontend/src/pages/Dashboard.tsx` → main page (status + list + details)
  - `frontend/src/components/*` → `SystemStatus`, `EmailCard`, `ESPDetails`, `ReceivingChain`
  - `frontend/vercel.json` → rewrite `/api/*` to Railway; SPA routing fallback

### Common Pitfalls & Fixes

- Backend builds but fails to run: install devDependencies on Railway (`npm ci --prefix backend --include=dev`) and run build before start.
- Atlas `ServerSelectionError`: add Railway egress IP or `0.0.0.0/0` temporarily to Atlas allowlist; verify credentials and SRV URL.
- CORS error in the browser: prefer same‑origin `/api` with Vercel rewrite; otherwise set `CORS_ORIGIN` to your Vercel origin.
- Frontend can’t reach backend: test the backend endpoint directly and verify the Vercel rewrite by opening `/api/emails/status` on the frontend domain.



