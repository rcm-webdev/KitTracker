# Strawhats

Centralized ophthalmic procedure supply tracking for clinical operations. Replace tribal knowledge and staff interruptions with QR-labeled supply bins, camera scanning, and full-text search — so teams can find what they need during day-to-day workflow without opening every cart or asking around.

**Production goal:** A procedural supply reference and inventory management system deployed in active clinical use.

## Features

- **Bins** — create bins with a name, location, and optional description
- **Items** — add and manage items stored inside each bin
- **Search** — full-text search across all bins and items
- **QR Labels** — generate a printable QR code label for any bin
- **Scanner** — scan a bin's QR code with your camera to open it instantly
- **Auth** — email/password registration and login with 7-day sessions
- **Admin** — admins can view, ban, and manage all user accounts

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router v7, TailwindCSS, shadcn/ui |
| Data fetching | TanStack Query, Axios |
| Forms | React Hook Form + Zod |
| Backend | Express.js |
| Auth | Better Auth (email/password + admin plugin) |
| Database | PostgreSQL via Prisma 7 + `@prisma/adapter-pg` |
| Testing | Vitest (component), Playwright (E2E) |

The project is an npm workspaces monorepo: deployable apps live under `apps/`, shared libraries under `packages/`.

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Setup

1. Install dependencies from the repo root:

```bash
npm install
```

2. Create the server environment file:

```bash
cp apps/server/.env.example apps/server/.env
```

Fill in the values:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/strawhats
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3001
CLIENT_URL=http://localhost:5173
PORT=3001
```

3. Run database migrations and generate the Prisma client:

```bash
cd apps/server
npx prisma migrate dev    # first-time dev setup (creates + applies migrations)
# or from repo root after pulling new migrations:
npm run db:migrate        # applies pending migrations only (e.g. providerTags column)
npx prisma generate
```

If the dashboard shows **500** on `/api/bins`, you almost certainly need `npm run db:migrate` — the schema added `providerTags` on bins in migration `20260525150000_bin_provider_tags`.

4. Seed the **demo clinic account** (8 surgeons, one procedure kit each):

```bash
npm run db:seed
# or: cd apps/server && npx prisma db seed
```

**Demo login**

| Field | Value |
|-------|--------|
| Email | `demo@strawhats.clinic` |
| Password | `demo-demo-demo` |

**Clinic tablet (QR scan PIN)**

| Field | Value |
|-------|--------|
| Username (shown on public kit page) | `Clinic Tablet` |
| PIN | `88888888` (override with `KIOSK_PIN` in `apps/server/.env`) |

Printed QR codes link to `/k/:kitId` — a read-only supply sheet for area tablets. Staff can enter the PIN to open the full app for that kit.

**Team technician (example)**

| Field | Value |
|-------|--------|
| Email | `tech.dr-eye@strawhats.clinic` |
| Password | `demo-demo-demo` |
| Assigned surgeons | Dr. Eye only — can edit Dr. Eye kits, not create kits or access other teams |

**Roles**

| Role | Create kits | Edit team kits | Dashboard / search | QR scan |
|------|-------------|----------------|--------------------|---------|
| `lead` | Yes (assigned surgeons only) | Yes | Yes | Yes |
| `technician` | No | Yes (assigned surgeons only) | Yes | Yes |
| `kiosk` | No | No (view via `/k/:id` or signed-in read-only) | No (scan only) | Yes |
| `admin` | Yes | Yes (all kits) | Admin UI | Yes |

Surgeon assignments are stored on each user as `assignedProviders` (see migration `20260525160000_user_assigned_providers`).

The seed creates kits tagged for **Dr. Eye** through **Dr. Eye8**, each with sample supplies so you can filter by provider and scan QR labels during a walkthrough. Re-running the seed refreshes kits for the same user.

### Docker

Run the full stack (PostgreSQL, API, and nginx-served SPA on one origin):

```bash
# Optional: copy and set BETTER_AUTH_SECRET / APP_URL
cp .env.docker.example .env.docker

docker compose up --build
```

Open **http://localhost:8080** (override with `APP_PORT` in `.env.docker`).

The `web` container serves the React build and proxies `/api/*` to the Express server so cookies and Better Auth stay same-origin.

Load demo data after the stack is healthy:

```bash
docker compose --profile seed run --rm seed
```

Use the demo credentials from the table above (`demo@strawhats.clinic` / `demo-demo-demo`).

**Compose services**

| Service | Role |
|---------|------|
| `db` | PostgreSQL 16 |
| `server` | Express API; runs `prisma migrate deploy` on startup |
| `web` | nginx + static client |
| `seed` | One-off demo seed (`--profile seed`) |

Set `APP_URL` to the URL you use in the browser (default `http://localhost:8080`) so Better Auth trusted origins match.

### Running

Start both apps in one terminal:

```bash
npm run dev   # Express API on http://localhost:3001 + React on http://localhost:5173
```

Or run them separately:

```bash
npm run dev:server   # Express API only
npm run dev:client   # React app only
```

## Testing

```bash
# Component tests (Vitest)
npm run test --workspace=@kittracker/client

# E2E tests (Playwright — auto-starts both servers)
npm run test:e2e

# Interactive UIs
npm run test:ui --workspace=@kittracker/client
npm run test:ui --workspace=@kittracker/e2e
```

## Project Structure

```
strawhats/
├── apps/
│   ├── client/    # React + Vite SPA
│   ├── server/    # Express API + Prisma
│   │   └── prisma/
│   └── e2e/       # Playwright tests
└── packages/
    └── shared/    # Shared TypeScript types
```

## Database Schema

- **Bin** — `id`, `userId`, `name`, `location`, `description?`, timestamps
- **Item** — `id`, `binId`, `name`, `description?`, `createdAt` (cascade-deletes with bin)
- **User / Session / Account / Verification** — managed by Better Auth

## API Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/bins` | List bins for the current user |
| `POST` | `/api/bins` | Create a bin |
| `GET` | `/api/bins/:id` | Get a single bin with its items |
| `PUT` | `/api/bins/:id` | Update a bin |
| `DELETE` | `/api/bins/:id` | Delete a bin and its items |
| `POST` | `/api/bins/:id/items` | Add an item to a bin |
| `PUT` | `/api/items/:id` | Update an item |
| `DELETE` | `/api/items/:id` | Delete an item |
| `GET` | `/api/search?q=` | Search bins and items |
| `GET` | `/api/admin/users` | List all users (admin only) |
| `ALL` | `/api/auth/*` | Better Auth handler |
