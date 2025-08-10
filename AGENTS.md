# AGENTS.md — Couples Therapy & Insights Platform Brain

This file tells Codex exactly what this platform is, how it works, and the rules for building it.

---
0) Mission
Create a state-of-the-art Couples Therapy & Insights Platform that:

Lets Partner A create an account and invite Partner B into a paired account (one couple record; two users).

Each partner completes private assessments: psychological quizzes, relationship history, free-text.

Optional spiritual insights: Palmistry (hand photos), Vedic Astrology (DOB/TOB/POB), Numerology (DOB).

System merges signals into a therapy structure (plan) that’s practical, culturally sensitive, and coach-ready.

Coaches get a dashboard: risk-based triage, session planner, homework tracker, consent-aware visibility, PDFs, and calendar hooks.

Privacy first: RLS everywhere, consent filters for raw text and media, and clear sharing controls.

1) Tech Stack
Backend: Node 18+, Express (ESM), @supabase/supabase-js v2 (user JWT → RLS)

Frontend: Vite + React 18, React Router, Zustand

DB: Supabase Postgres with RLS, SQL migrations under /server/migrations

Auth: Supabase Auth (email/password)

Storage: Supabase Storage (palm images) with signed URLs

Deploy: Railway (single service: server + built frontend)

2) Core User Flow
Pairing & Onboarding
Partner A signs up → creates couples row → sends pair code/invite.

Partner B signs up with the code → joins the same couple.

Both partners now have separate submissions protected by RLS.

Data Collection Modules (all optional except core assessment)
Psychology Assessment (Likert & text)

Palmistry Uploads: left & right palm images, dominant hand

Vedic Astrology: DOB, TOB, POB → charts & compatibility

Numerology: DOB → Life Path, Expression, Soul Urge

Consent per module: share with partner? share raw text? share with coach? allow AI summaries?

Analysis & Planning
Compute domain scores (communication, trust, conflict, intimacy, time, money, family, responsibility, repair, wellbeing).

Merge themes (NLP) from free-text (with consent).

Blend in palmistry traits, astrology compatibility/timing, numerology tendencies.

Output: Report + Personalized Plan (2-week starter + coach checklist) → PDF export → Calendar hooks.

3) Environment
Server .env

makefile
Copy
Edit
SUPABASE_URL=
SUPABASE_ANON_KEY=
PORT=8080
COACH_API_KEY=
# seeding only (never in long-running prod):
# SUPABASE_SERVICE_ROLE=
Frontend .env (build-time)

makefile
Copy
Edit
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
4) Database Design (Complete List)
Below are the tables/columns (✅ already exist; 🆕 new/updated). Keep RLS tight: partners only see their couple’s derived/allowed data; coaches only through server-key endpoints.

Identity & Pairing
✅ app_users(user_id, full_name, role, created_at, updated_at)

✅ couples(id, pair_code, created_by, created_at, updated_at)

✅ couple_members(id, couple_id, user_id, label) – label ∈ {A,B}; unique per couple.

RLS: partner can read their couple; inserts/updates gated by membership.

Assessment & Advice (psychological)
✅ assessments(id, title, version, is_active, created_at, updated_at)

✅ questions(id, assessment_id, domain, qtype, prompt, weight, required, position)

✅ question_options(id, question_id, label, value)

✅ submissions(id, assessment_id, user_id, status, started_at, completed_at)

✅ responses(id, assessment_id, submission_id, question_id, user_id, value_numeric, value_text, created_at)

✅ consents(id, couple_id, user_id, share_with_partner, share_with_coach, allow_raw_text, updated_at)

🆕 add columns:

allow_palmistry boolean default false

allow_astrology boolean default false

allow_numerology boolean default false

share_media_with_coach boolean default false (for images)

✅ advice_blocks(id, domain, title, body, steps, resources, severity, created_at)

✅ advice_rules(id, domain, condition, advice_block_id, priority)

Scoring & Report Views
✅ v_partner_domain_scores (computed domain scores)

✅ v_couple_domain_gaps (A vs B differences)

✅ v_couple_risk_index (risk index)

✅ active_assessment (view)

✅ get_couple_report(couple_id) (RPC; requires both complete)

Sessions, Agenda, Homework, Coach Notes (therapy planner)
✅ sessions(id, couple_id, assessment_id, title, session_date, status, created_by, created_at, updated_at)

✅ session_agenda_items(id, session_id, position, title, details, duration_minutes)

✅ homework(id, couple_id, session_id, domain, title, description, assigned_at, due_date, assigned_by, status, progress_note)

✅ coach_notes(id, session_id, created_at, note) – RLS blocks partner access (coach-only via server key endpoints).

In-App Messaging (consent aware)
🆕 messages:

id uuid pk

couple_id uuid not null refs couples

from_role text check in ('partner','coach') not null

user_id uuid (nullable for coach)

body text not null

created_at timestamptz default now()

is_private_to_coach boolean default false (coach notes disguised as messages if needed)

Consent logic:

If share_with_coach=false for a partner, coach cannot see their raw text messages; server must redact body → "[redacted]" for coach views.

Partner-to-partner display only within the couple.

RLS:

Partners: read/write only where couple_id in their membership.

Coach: no direct RLS; coach accesses via server routes with COACH_API_KEY, which must enforce redaction.

NLP Themes
🆕 nlp_themes:

id uuid pk

couple_id uuid refs couples

source enum('response','message')

source_id uuid (points at responses.id or messages.id)

domain domain_enum null (optional mapping)

theme text not null (e.g., 'in-laws', 'stonewalling', 'screen overuse')

weight numeric(5,2) default 1.0

created_at timestamptz default now()

Consent:

If allow_raw_text=false, store only themes/weights (no raw text copy).

Coach view shows themes/weights but never raw text unless consented.

Localization (i18n) & Cultural Advice Packs
🆕 advice_blocks_i18n:

advice_id text refs advice_blocks(id)

locale text (BCP47, e.g., en, hi-IN)

title text, body text, steps jsonb, resources jsonb, cultural_notes text

primary key (advice_id, locale)

Plan generation will prefer locale when available; fallback to en.

Calendar Hooks (Google/Outlook)
🆕 calendar_tokens (server-only access; NO RLS for clients):

user_id uuid pk refs auth.users

provider text check in ('google','microsoft')

refresh_token text (encrypted/hashed at rest by Supabase if possible)

created_at timestamptz default now()

Use server endpoints for OAuth callbacks and scheduling recurring “money dates” / “connection windows”.

Spiritual Insights — Palmistry
Storage bucket: palmistry with RLS: only the uploading user can list/get their files; coach access only via signed URLs generated by server if share_media_with_coach=true.

🆕 palmistry_submissions:

id uuid pk

couple_id uuid refs couples

user_id uuid refs auth.users

dominant_hand text check in ('left','right')

left_palm_path text, right_palm_path text (storage paths)

notes text (optional partner notes)

created_at timestamptz default now()

🆕 palmistry_traits (derived — optional, can be generated by manual or AI pipeline):

id uuid pk

submission_id uuid refs palmistry_submissions

trait text (e.g., 'heart_line_long', 'mount_venus_prominent')

impact text (human-readable interpretation)

weight numeric(5,2)

Spiritual Insights — Vedic Astrology
🆕 astrology_birthdata:

id uuid pk

couple_id uuid refs couples

user_id uuid refs auth.users

dob date not null, tob time not null, pob text not null

tz_offset_minutes int (capture exact birth time zone)

created_at timestamptz default now()

🆕 astrology_results (derived):

id uuid pk

birthdata_id uuid refs astrology_birthdata

lagna text, moon_sign text, sun_sign text

compatibility_score numeric(5,2) (relative to partner)

timing jsonb (e.g., major supportive/challenging periods)

summary text

created_at timestamptz default now()

Spiritual Insights — Numerology
🆕 numerology_profiles:

id uuid pk

couple_id uuid refs couples

user_id uuid refs auth.users

dob date not null

life_path int, expression int, soul_urge int

summary text

created_at timestamptz default now()

5) RLS Principles (apply policies accordingly)
Partners can access only rows tied to their couple_id.

Partner raw free-text and media are never exposed to coach unless the partner’s consents allow it.

coach_notes and coach-only reads are served only via server endpoints with COACH_API_KEY and must apply redaction rules when allow_raw_text=false.

calendar_tokens are accessible server-only (no client RLS access). Use server to act on user’s behalf after OAuth consent.

Storage: use signed URLs for any coach media view; check consent each time.

6) API Contracts (to maintain/extend)
Existing (psychology)

GET /assessments/active

POST /submissions/start

POST /responses/batch

POST /submissions/complete

GET /report/couple/:id

POST /plan/generate {couple_id}

GET /coach/couples (coach key)

GET /coach/couples/:id/overview (coach key)

GET /sessions?couple_id=...

POST /sessions, GET/POST /sessions/:id/agenda

GET /sessions/homework/list?couple_id=...

POST /sessions/homework, POST /sessions/homework/:id/status

New (this doc)

Messaging:

GET /messages?couple_id=...&cursor=...

POST /messages {couple_id, body} (from partner)

POST /coach/messages {couple_id, body} (coach; coach key)

Server redacts bodies for coach where share_with_coach=false or allow_raw_text=false.

Palmistry:

POST /palmistry/upload (returns storage paths; requires allow_palmistry=true)

GET /palmistry/me (list my submissions)

GET /coach/palmistry/:coupleId (coach key; returns signed URLs only if share_media_with_coach=true)

Astrology:

POST /astrology/birthdata (save dob/tob/pob; requires allow_astrology=true)

POST /astrology/compute (server-side compute → astrology_results)

GET /astrology/me (my computed summary)

Numerology:

POST /numerology/profile (calculate & store from DOB; requires allow_numerology=true)

GET /numerology/me

NLP Themes:

internal service scans on responses/messages create → nlp_themes rows

GET /themes/:coupleId → aggregated themes (respect consent)

PDF Export:

GET /export/plan/:coupleId (partner/coach)

GET /export/report/:coupleId (partner/coach)

Calendar:

GET /oauth/google/start, GET /oauth/google/callback

GET /oauth/microsoft/start, GET /oauth/microsoft/callback

POST /calendar/schedule {type:'money_date'|'connection_window', cadence:'weekly', ...}

7) Migrations Checklist (apply in order)
Create migration files under /server/migrations (or run consolidated SQL carefully):

Consents update

Add: allow_palmistry, allow_astrology, allow_numerology, share_media_with_coach.

Messaging

Create messages + RLS (partners limited to couple; deny coach via RLS; coach reads via server).

NLP Themes

Create nlp_themes; indexes on (couple_id, created_at) and (theme).

Localization

Create advice_blocks_i18n.

Calendar

Create calendar_tokens (OPTION: a separate schema without RLS, server-only).

Palmistry

Create storage bucket palmistry with RLS policy (owner only).

Create palmistry_submissions, palmistry_traits.

Astrology

Create astrology_birthdata, astrology_results.

Numerology

Create numerology_profiles.

Keep existing RLS from the original schema; extend with policies for each new table to limit reads/writes to couple members. For any coach access, do not rely on RLS — use server routes + COACH_API_KEY + consent checks + redaction.

8) Implementation Roadmap (order for Codex)
PDF Export (E2) – server endpoints + buttons on Report/Plan; pdfkit or puppeteer.

Messaging (E3) – DB + RLS, server routes with redaction, simple chat in couple & coach dashboards.

Calendar Hooks (E4) – OAuth + scheduling endpoints (Google first).

NLP Themes (E5) – lightweight keyword pipeline; surface themes in coach dashboard & boost plan mapping.

Localization (E6) – i18n wiring, advice_blocks_i18n usage in plan generation.

Palmistry (E8) – storage + form + consent; optional manual traits; (later) ML extraction.

Astrology (E9) – birthdata form + compute (Node lib or microservice); compatibility & timing.

Numerology (E10) – calculate core numbers from DOB; short summaries.

Aggregated Therapy Structure (E11) – merge insights into a weekly structure with coach checklist.

9) Guardrails
Never commit secrets; never use service role in runtime routes.

Always check consent before exposing raw text, images, or derived summaries to coach or the other partner.

All partner-facing DB access uses user JWT so RLS applies.

Coach views go through server with COACH_API_KEY and explicit redaction logic.

Use signed URLs for media, short TTL, on-demand generation.

Keep UI simple, accessible, and clear about privacy.

10) Prompts Codex Can Use
“Create migrations for messages, nlp_themes, advice_blocks_i18n, calendar_tokens, palmistry_submissions, astrology_birthdata/results, numerology_profiles; add RLS.”

“Implement consent-aware /messages routes: partner send/list; coach list with redaction.”

“Add palmistry upload flow with Supabase Storage + signed URLs; respect share_media_with_coach.”

“Wire astrology & numerology forms and compute endpoints; save derived results.”

“Update plan composer to consider nlp themes + astrology timing + numerology tendencies; prefer i18n advice where available.”

“Add ‘Add to Calendar’ endpoints and buttons for money dates/connection windows.”
