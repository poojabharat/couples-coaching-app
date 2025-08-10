# Relationship Assessment API (Express + Supabase)

An Express API that proxies to Supabase using **Row Level Security**. The server forwards the **user's Supabase JWT** so all RLS policies apply exactly as designed.

## Quick Start

1. Create Supabase project and run the SQL from `supabase_relationship_app_schema.sql`.
2. Copy `.env.example` to `.env` and set:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. Install & run:
   ```bash
   npm i
   npm run dev
   # or for Railway
   npm start
   ```

> **Auth model:** The frontend should sign in with Supabase Auth and send the `Authorization: Bearer <access_token>` header to this API. The API re-creates a Supabase client per request with that token.

## Endpoints

- `POST /couples` → create a couple (returns `pair_code`)
- `POST /couples/join` → join by `pair_code` with label `A|B`
- `GET /assessments/active` → active assessment + questions + options
- `POST /submissions/start` → start (or upsert) a submission for active assessment
- `POST /responses/batch` → submit array of responses
- `POST /submissions/complete` → mark submission complete
- `POST /consents` → set sharing preferences
- `GET /couples/:id/report` → JSON report (only after both partners complete)

## Railway

- Set environment variables in Railway to match `.env`.
- `npm start` is the default command.

## Notes

- All DB operations go through Supabase with the **user's JWT** attached.
- Insert policies often require fields like `created_by = auth.uid()`. We populate those using the UID decoded from the token.
- Update your CORS origin as needed in `src/app.js`.

## New endpoints (Coach & Plan)
- `POST /plan/generate` { couple_id } → returns report + 2-week plan + coach checklist (requires couple member auth)
- `GET /coach/couples` → list couples by risk index (requires header `x-coach-key` = COACH_API_KEY)
- `GET /coach/couples/:id/overview` → plan + (if allowed) report for a couple (requires `x-coach-key`)

### Seeding advice library
- Set `SUPABASE_SERVICE_ROLE` (server env) temporarily and run:
```
npm run seed:advice
```
This loads `/seeds/advice.seed.json` into `advice_blocks` and `advice_rules`.

### Environment
- `COACH_API_KEY` → shared secret for coach endpoints (do not expose to client)
- `SUPABASE_SERVICE_ROLE` → **only for one-time seeding**, not needed at runtime.
