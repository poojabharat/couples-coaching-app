# Couples Relationship Assessment – Fullstack (Server + Frontend)

Single project you can push to Railway. The **Express server** serves the API and, in production, also serves the **React (Vite) frontend** as static files from `frontend/dist`.

## Structure
- `/server` – Express API (uses Supabase with RLS via user JWT)
- `/frontend` – React (Vite) SPA that authenticates with Supabase and calls the API

## Deploy (Railway)
1. Set **Environment Variables** (at project level):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `PORT` (Railway provides `PORT`, but keep a default locally)
2. Build command (Railway settings):  
   `npm run build`
3. Start command:  
   `npm start`

> The server will serve the prebuilt frontend automatically in production.

## Local Dev
```bash
# One-time
npm i --prefix server
npm i --prefix frontend

# Run API only (frontend via Vite dev server separately)
npm run dev

# In another terminal:
npm run dev --prefix frontend
```

## Coach Mode (secure)
- Set `COACH_API_KEY` on the Railway service.
- Access coach endpoints with header `x-coach-key: <your key>`.
- Do not expose this key in the browser for untrusted users. Use a separate coach-only frontend or guard with your own login if needed.

## Advice Library
Seed default advice content:
```bash
cd server
SUPABASE_SERVICE_ROLE=xxxx SUPABASE_URL=yyyy npm run seed:advice
```
