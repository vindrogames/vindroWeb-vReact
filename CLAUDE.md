# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Repo Structure

This is a **monorepo** with a React frontend and a Django backend as sibling directories, orchestrated via Docker Compose.

```
vindroWeb-vReact/
├── vindro-vite/          # React 18 frontend (Node.js / Vite)
├── vindro-django/        # Django 6 backend (Python / uv)
├── docker-compose.yml    # Multi-container local dev orchestration
└── .github/workflows/    # CI/CD (GitHub Actions → GitHub Pages)
```

---

## Commands

### Frontend — run from `vindro-vite/`

```bash
npm run dev       # Dev server at http://localhost:5173
npm run build     # Production build → dist/
npm run lint      # ESLint
npm run preview   # Serve production build locally
```

### Backend — run from `vindro-django/`

```bash
uv run python src/manage.py runserver          # Dev server at http://localhost:8000
uv run python src/manage.py migrate            # Apply DB migrations
uv run python src/manage.py makemigrations     # Generate new migrations
uv run python src/manage.py createsuperuser    # Admin user
```

### Docker (preferred for full-stack local dev) — run from repo root

```bash
docker compose up --build    # Build and start both services
docker compose up            # Start without rebuilding
docker compose down          # Stop and remove containers
docker compose logs -f       # Stream logs from all services
```

No test suite is configured on either side.

---

## Environment

### Frontend (`vindro-vite/.env`)

Copy `vindro-vite/.env.example` → `vindro-vite/.env`:

| Variable | Purpose | Dev value |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API root | `http://localhost:8000/api` |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile CAPTCHA | (get from Cloudflare dashboard) |
| `VITE_AUTH_CHEAT` | Skip backend auth check | `true` (frontend-only dev) |

Production defaults to `https://backend.vindrogames.com/api`.

### Backend (`vindro-django/.env.local`)

Copy `vindro-django/.env.example` → `vindro-django/.env.local`:

| Variable | Purpose |
|---|---|
| `DJANGO_SECRET_KEY` | Django secret key |
| `DJANGO_DEBUG` | `True` for dev, `False` for prod |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated allowed hostnames |
| `FRONTEND_URL` | Allowed CORS origin (e.g. `https://vindrogames.com/`) |
| `CORS_ALLOWED_ORIGINS` | Additional CORS origins |
| `CSRF_TRUSTED_ORIGINS` | CSRF whitelist |
| `SESSION_COOKIE_SECURE` | `True` in prod (HTTPS only) |
| `SESSION_COOKIE_SAMESITE` | `Lax` |
| `SESSION_COOKIE_DOMAIN` | `.vindrogames.com` in prod |
| `ACCOUNT_EMAIL_VERIFICATION` | `mandatory` or `none` |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth app credentials |
| `GITHUB_CLIENT_ID/SECRET` | GitHub OAuth app credentials |
| `FACEBOOK_APP_ID/SECRET` | Facebook OAuth app credentials |
| `CLOUDFLARE_TURNSTILE_SECRET_KEY` | Server-side CAPTCHA validation |

---

## Containerization

### Docker Compose services

**`vindro-backend`**
- Builds from `vindro-django/Dockerfile` (Python 3.12-slim + `uv`)
- Exposed on port **8000**
- Entrypoint (`entrypoint.sh`): runs `migrate` then `runserver 0.0.0.0:8000`
- Mounts `./vindro-django/src:/app/src` for live reload
- Loads `vindro-django/.env.local`
- Health check: `GET /test/` every 30s

**`vindro-frontend`**
- Builds from `vindro-vite/Dockerfile` (Node.js 20-alpine)
- Exposed on port **5173**
- `depends_on: vindro-backend (condition: service_healthy)` — waits for backend to be ready
- Mounts `./vindro-vite:/app` + anonymous volume for `node_modules` (avoids host/container conflict)
- Runs `npm run dev -- --host 0.0.0.0`
- Vite watcher uses polling + explicit HMR host for Docker filesystem compatibility

Both services share a bridge network `vindro-network` so the frontend container can reach the backend at `http://vindro-backend:8000`.

### Dockerfile details

**Backend (`vindro-django/Dockerfile`)**
```
Python 3.12-slim → install uv → uv sync --frozen --no-dev → dos2unix entrypoint.sh → CMD entrypoint.sh
```

**Frontend (`vindro-vite/Dockerfile`)**
```
Node 20-alpine → npm ci → EXPOSE 5173 → CMD npm run dev -- --host 0.0.0.0
```

---

## DevOps / CI-CD

**File:** `.github/workflows/main.yml`

**Trigger:** Push to `develop` branch, or manual `workflow_dispatch`.

**Pipeline steps:**
1. Checkout code
2. Setup Node 18 with npm cache
3. `npm ci` in `vindro-vite/`
4. `npm run build` → `vindro-vite/dist/`
5. Upload `dist/` as GitHub Pages artifact
6. Deploy to GitHub Pages

**Result:** Frontend auto-deploys to GitHub Pages on every push to `develop`.

Backend deployment is handled separately (not in this CI file). Production backend runs at `https://backend.vindrogames.com`.

---

## Backend — Django

**Source root:** `vindro-django/src/`

**Django apps:**

| App | Path | Responsibility |
|---|---|---|
| `vindrobackend` | `vindrobackend/` | Settings, URL root, WSGI/ASGI |
| `accounts` | `accounts/` | Custom User model, auth views |
| `tournament` | `tournament/` | Tournament predictions, pools, leaderboards |
| `highscores` | `highscores/` | Per-game score tracking |
| `test` | `test/` | Health check endpoint (`/test/`) |

### Database

- **Dev:** SQLite (`vindro-django/src/db.sqlite3`)
- **Prod:** Can swap to PostgreSQL via `DATABASES` setting in `settings.py`
- Migrations live in each app's `migrations/` folder; always run after pulling model changes

### Data models

**accounts**
- `User` — extends `AbstractUser`. Fields: `username`, `email`, `avatar` (URL), `provider` (oauth source), `login_count`

**tournament**
- `Tournament` — `name`, `slug`, `status`, date fields (`start_date`, `end_date`, `groups_end_date`, `bracket_start_date`)
- `TournamentFormat` — `groups_stage` (JSON), `bracket_stage` (JSON), `results` (JSON) — FK to Tournament
- `TournamentPlay` — a user's prediction entry for a tournament. Fields: `user`, `tournament`, `name` (max 42 chars), `group_points`, `bracket_points`, `predictions` (JSON)
- `TournamentPool` — prediction pool. Fields: `tournament`, `pool_type` (public/private/money), `code_hash` (SHA-256 for private), `name`, `money_amount`
- `PoolMembership` — through table: `play` FK + `pool` FK

**highscores**
- `Gamescore` — flexible per-game. Fields: `user`, `game_name`, `game_score`, `game_time`, `game_metadata` (JSON)

### Auth

- Session-based (Django sessions). Auth state lives in a cookie.
- Optional OAuth via `django-allauth` (Google, GitHub, Facebook).
- `@login_required_api` decorator used on protected views — returns 401 JSON instead of redirect.
- CSRF token injected from cookie on every write request by the frontend.

### API URL structure

All API routes are prefixed with `/api/`. Base: `https://backend.vindrogames.com/api` in prod, `http://localhost:8000/api` in dev.

| Endpoint | Method | Purpose |
|---|---|---|
| `/auth/me/` | GET / PATCH | Get or update current user |
| `/auth/login/` | POST | Login |
| `/auth/register/` | POST | Register |
| `/auth/logout/` | POST | Logout |
| `/auth/change-password/` | POST | Change password |
| `/tournament/` | GET | List all tournaments |
| `/tournament/{slug}/` | GET | Tournament detail |
| `/tournament/{id}/user-plays/` | GET | Current user's plays for a tournament |
| `/tournament/{id}/create/` | POST | Create a play |
| `/tournament/plays/{playId}/` | GET | Get a single play |
| `/tournament/plays/{playId}/update-groups/` | PATCH | Update group stage predictions |
| `/tournament/plays/{playId}/update-bracket/` | PATCH | Update bracket predictions |
| `/tournament/{id}/user-pool-submissions/` | GET | Current user's pool memberships |
| `/tournament/{id}/pools/join/` | POST | Join an existing pool |
| `/tournament/{id}/pools/create/` | POST | Create a new pool |
| `/tournament/{id}/leaderboard/public/` | GET | Public leaderboard |
| `/tournament/{id}/leaderboard/pool/{poolId}/` | GET | Pool leaderboard |
| `/highscores/` | GET / POST | Score retrieval and submission |
| `/test/` | GET | Health check |

Views are Django function-based views. Serialization is done with custom JSON functions (no DRF).

---

## Frontend — React

**Stack:** React 18 + React Router v6 + Vite + SASS. No Redux — state is managed via React Context and custom hooks.

**Source root:** `vindro-vite/src/`

### Directory layout

```
src/
├── main.jsx              # Entry point — renders App, wraps HelmetProvider
├── App.jsx               # RouterProvider wrapper
├── routes.jsx            # createBrowserRouter — all route definitions
├── pages/                # Route-level page components
├── features/             # Feature domains (see below)
├── components/
│   ├── ui/               # Reusable atomic UI components
│   ├── pages/            # Page-specific sub-components
│   └── layout/           # Header, Footer, Layout
├── contexts/
│   ├── auth/             # AuthContext + authService
│   └── LoadingContext.jsx
├── services/
│   └── api.js            # Central fetch wrapper
├── scss/                 # SASS partials + main.scss
├── page-helmets/         # react-helmet-async per-page SEO components
├── utils/                # Shared utility functions
└── assets/               # Static assets
```

### Layers

| Layer | Path | Purpose |
|---|---|---|
| Pages | `pages/` | Route-level components |
| Features | `features/` | Business logic per feature domain |
| Components | `components/ui/`, `components/pages/`, `components/layout/` | Shared UI, page sub-components, Layout/Header/Footer |
| Services | `features/*/services/`, `services/api.js` | API calls |
| Hooks | `features/*/hooks/` | Data fetching and game logic |
| Contexts | `contexts/` | Global state (auth, loading) |
| Styles | `scss/` | SASS partials per feature + responsive breakpoints |
| SEO | `page-helmets/` | `react-helmet-async` components per page |

### API layer

`services/api.js` exports `apiRequest(endpoint, options)`. All feature services and auth calls go through this function.

- Reads `VITE_API_BASE_URL` from env; falls back to production URL
- Automatically reads CSRF token from cookies and injects it as `X-CSRFToken` header on write operations
- Sends `credentials: 'include'` on all requests so session cookies travel with every call
- Returns parsed JSON; throws on non-2xx responses

### Routing

Defined in `routes.jsx` via `createBrowserRouter`. `<Layout>` (Header + Outlet + Footer) wraps all routes.

`<ProtectedRoute>` reads from `AuthContext` — redirects unauthenticated users to login. The madrid-calculator route applies a `madrid-theme` CSS class to the layout root.

**Public routes:** `/`, `/register`, `/story`, `/brackets`, `/games`, `/contact`, `/games/*`, `/privacy-cookies`, `/test-api`, `/brackets/world-cup-2026`, `/brackets/:tournament/:userId/:playName`

**Protected routes:** `/user/:userId`, `/user/:userId/brackets`, `/user/:userId/topScores`

### Contexts

**`AuthContext`** (`contexts/auth/AuthContext.jsx`)
- Provides `useAuth()`: `user`, `login()`, `register()`, `logout()`, `updateUser()`, `refreshUser()`
- Calls `authService.js` which calls `api.js`

**`LoadingContext`** (`contexts/LoadingContext.jsx`)
- Provides `useLoading()`: `showLoader()`, `hideLoader()`
- Renders a full-screen spinner overlay via React portal

### Features

#### brackets (Tournament Predictions)

Hooks in `features/brackets/hooks/`:

| Hook | Purpose |
|---|---|
| `useTournament(slug, doGetResults)` | Fetch tournament metadata + optional results |
| `usePlays(tournamentId, user, tournamentSlug)` | User's plays — create, list, refresh. Play name max 42 chars |
| `usePools(tournamentId, user)` | Join or create pools |
| `useLeaderboard(tournamentId)` | Fetch public and pool-specific leaderboards |

Services in `features/brackets/services/`:
- `tournamentServices.js` — getTournamentBySlug, getTournamentResults
- `playServices.js` — getUserPlays, createPlay, getPlayById, updateGroupPredictions, updateBracketPredictions
- `poolServices.js` — getUserPools, joinPool, createPool
- `leaderboardServices.js` — getPublicLeaderboard, getPrivatePoolLeaderboard

Tournament static data (team lists, bracket templates) lives in `features/brackets/tournaments/`.

#### autominer (Idle Clicker Game)

`useAutominer()` in `features/autominer/hooks/`:
- Encapsulates all game state: iron, sulfur, drills, silver, workers
- 1-second `setInterval` game loop
- Exponential worker costs; 5-click silver mechanic
- Auto-buy logic with configurable rates

#### game-42 (Number Placement)

`useGame42Logic()` in `features/game-42/hooks/`:
- Manages round state, number to place, scoring, game-over conditions
- Persists `prevPoints` and `todayBest` in `sessionStorage`

#### madrid-calculator

`useCalculator()` in `features/madrid-calculator/hooks/`:
- Full calculator state machine: operands, operators, display
- 3 decimal precision, 16-char operand limit
- `setChampionsValue()` — hardcoded 15 (Champions League joke)

#### escape-the-cloud

Simple standalone game component — no dedicated hook.

### Styles

**Master file:** `scss/main.scss` — imports all partials.

**Responsive breakpoints (mobile-first overrides):**
- `_mobile376.scss` — 376px
- `_mobile450.scss` — 450px
- `_mobile678.scss` — 678px
- `_mobile960.scss` — 960px

**Color palette (defined in `_config.scss`):**
- Primary: Teal `#66FCF1`, Black `#0B0C10`, Gray `#1F2833`
- Accents: Yellow `#FAC550`, Green `#45A29E`, Red `#E62644`
- FIFA/Real Madrid: Blue `#004996`, Yellow `#FCBF00`

Fonts: Montserrat (headings), Open Sans (body).

### Frontend dependencies

| Package | Purpose |
|---|---|
| `react@^18.2` | UI framework |
| `react-router-dom@^6.26` | Client routing |
| `react-icons@^5.3` | Icon library |
| `flag-icons@^7.5` | Country flag CSS |
| `react-helmet-async@^2.0` | Per-page SEO meta tags |
| `sass@^1.78` | SCSS compilation |
| `vite@^5.4` | Build tool + dev server |

---

## Data flow summary

```
User interaction
  → React component
  → Custom hook (e.g. usePlays)
  → Feature service (e.g. playServices.js)
  → apiRequest() in services/api.js
      ├─ Injects CSRF token from cookie
      ├─ Attaches session cookie (credentials: include)
      └─ Resolves base URL from env
  → Django view (function-based)
  → Django ORM
  → SQLite (dev) / PostgreSQL (prod)
  → JSON response
  → Hook state update
  → Component re-render
```
