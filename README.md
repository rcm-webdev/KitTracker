# Strawhats

A home storage bin inventory app. Create bins, track items inside them, generate printable QR code labels, and scan codes with your camera to jump straight to any bin.

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

The project is an npm workspaces monorepo with four packages: `client`, `server`, `shared`, and `e2e`.

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
cp server/.env.example server/.env
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
cd server
npx prisma migrate dev
npx prisma generate
```

### Running

Start both servers in separate terminals:

```bash
npm run dev:server   # Express API on http://localhost:3001
npm run dev:client   # React app on http://localhost:5173
```

## Testing

```bash
# Component tests (Vitest)
npm run test --workspace=client

# E2E tests (Playwright — auto-starts both servers)
npm run test:e2e

# Interactive UIs
npm run test:ui --workspace=client
npm run test:ui --workspace=e2e
```

## Project Structure

```
strawhats/
├── client/        # React + Vite SPA
├── server/        # Express API + Prisma
│   └── prisma/    # Schema and migrations
├── shared/        # Shared TypeScript types
└── e2e/           # Playwright tests
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
