# Event Analytics

A responsive single-page app that ingests, displays, and filters live user
activity logs in near real time.

- **Backend:** Python 3.12, Django 5 + DRF, PostgreSQL 16, Gunicorn
- **Frontend:** React 18 + TypeScript (strict) + Vite, Tailwind, TanStack Query, Recharts
- **Infra:** Docker / docker-compose, Nginx serving the SPA and proxying `/api`
- **API docs:** Swagger UI at `/api/docs`, OpenAPI schema at `/api/schema`

## Architecture

```
Browser (React SPA, port 3000)
   │  /api/* requests
   ▼
Nginx (frontend container) ── proxies /api/ ──► Backend (Django/DRF + Gunicorn, :8000)
   │ serves built SPA on :80                       │
   └───────────────────────────────────────────────▼
                                          PostgreSQL 16 (private network)
```

### Design decisions

- **Polling over WebSockets/SSE:** the dashboard polls `/api/events` every 5 s
  (and `/api/events/analytics` every 30 s). Polling keeps the backend
  stateless and the client simple; the interval is short enough for a live
  feel. WebSockets would require channels + a broker — noted as a next step.
- **PostgreSQL only:** JSONB payloads, real indexes, `TruncHour` aggregation —
  no SQLite anywhere, including tests.
- **Indexes:** `user_id`, `event_type`, `timestamp` each indexed, plus a
  composite `(event_type, timestamp DESC)` covering the common
  "filter by type, sort newest first" access pattern.
- **Throttling:** a DRF `SimpleRateThrottle` keyed by client IP
  (30 req/min default). The counter lives in Django's `DatabaseCache`
  (`django_cache_table`) so the limit is shared correctly across Gunicorn
  workers without adding Redis. `NUM_PROXIES` (default 1) makes DRF trust
  `X-Forwarded-For` from the Nginx proxy.
  - **Trade-off:** 5 s polling alone is 12 req/min; polling + analytics +
    interactive filtering can approach 30/min. When the limit is hit the UI
    reads `Retry-After`, pauses polling, and shows a banner instead of
    retrying in a tight loop.
- **Error envelope:** every error response is
  `{"error": {"code", "message", "details"}}` via a custom DRF exception
  handler; DB connectivity failures map to 503, malformed JSON to 400, and
  no stack traces are leaked.

## Quick start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

Then open http://localhost:3000 — the dashboard talks to the API through the
Nginx proxy. API docs at http://localhost:8000/api/docs (via compose, the
backend port isn't published; open http://localhost:3000/api/docs instead).

Seed demo data:

```bash
docker compose exec backend python manage.py seed_events --count 500
```

## Local development

Backend (requires a running Postgres, e.g. `docker compose up db`):

```bash
cd backend
python -m venv venv && venv\Scripts\activate   # or source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env                          # point POSTGRES_* at your DB
python manage.py migrate
python manage.py createcachetable
python manage.py runserver                    # http://localhost:8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev                                   # http://localhost:5173, proxies /api -> :8000
```

## Environment variables

Backend (`backend/.env.example` / compose `environment`):

| Variable                | Default                                          | Purpose                                  |
|-------------------------|--------------------------------------------------|------------------------------------------|
| `SECRET_KEY`            | `insecure-dev-secret-key-change-me`              | Django secret key — set a real one       |
| `DEBUG`                 | `False`                                          | Debug mode (never true in prod)          |
| `ALLOWED_HOSTS`         | `localhost,127.0.0.1`                            | Comma-separated host allowlist           |
| `DATABASE_URL`          | unset                                            | `postgres://user:pass@host:port/db` — takes precedence over `POSTGRES_*` |
| `POSTGRES_DB/USER/PASSWORD/HOST/PORT` | `event_analytics`/`event_user`/`event_pass`/`localhost`/`5432` | DB connection parts |
| `CONN_MAX_AGE`          | `60`                                             | Persistent DB connections (seconds)      |
| `CORS_ALLOWED_ORIGINS`  | `http://localhost:3000`                          | Comma-separated CORS origins             |
| `RATE_LIMIT_PER_MINUTE` | `30`                                             | Per-IP request cap                       |
| `NUM_PROXIES`           | `1`                                              | Trusted proxies in front (for `X-Forwarded-For`) |
| `MAX_PAYLOAD_BYTES`     | `16384`                                          | Max serialized JSON payload size         |
| `LOG_LEVEL`             | `INFO`                                           | Python logging level                     |

Frontend: `VITE_API_BASE_URL` (default `/api`).

## API reference

All endpoints return the error envelope `{"error":{code,message,details}}`
with codes `validation_error | duplicate_event | not_found | rate_limited |
service_unavailable | server_error`.

**`POST /api/events`** — ingest an event.

```bash
curl -X POST http://localhost:8000/api/events \
  -H 'Content-Type: application/json' \
  -d '{
    "id": "11111111-1111-1111-1111-111111111111",
    "user_id": "user_42",
    "event_type": "user.login",
    "payload": {"source": "web"},
    "timestamp": "2025-06-15T12:00:00Z"
  }'
```

- `201` on success, `400` on validation errors, `409` on duplicate `id`.
- `event_type` must match `^[a-zA-Z0-9_.:-]+$`; `timestamp` may be naive
  (treated as UTC) but no more than 5 minutes in the future.

**`GET /api/events`** — paginated list (newest first).

```bash
curl 'http://localhost:8000/api/events?page=1&limit=20&event_type=user.login,page.view&search=hello&date_from=2025-06-15T00:00:00Z&date_to=2025-06-16T00:00:00Z'
```

Response: `{count, page, limit, total_pages, next, previous, results}`.

**`GET /api/events/analytics?hours=24`** — totals, top-10 `counts_by_type`,
and a zero-filled hourly `timeline`. `hours` must be 1–168.

**`GET /api/health`** — `200 {"status":"ok"}` or `503`.

## Tests

Backend tests run against a real Postgres (pytest-django creates a test
database; the DB user needs `CREATEDB`):

```bash
make test            # backend pytest + frontend vitest
make lint            # frontend oxlint + backend compileall
# or individually:
cd backend && venv/Scripts/python -m pytest
cd frontend && npm run test
```
