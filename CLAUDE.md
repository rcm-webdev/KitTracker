# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
****
```bash
# Development (run concurrently in separate terminals)
npm run dev:server          # Express server on port 3001 (tsx watch)
npm run dev:client          # Vite client on port 5173

# Testing
npm run test:e2e            # Playwright E2E tests (auto-starts both servers)
npm run test:ui --workspace=e2e   # Interactive Playwright UI

# Build
npm run build --workspace=server  # tsc → dist/
npm run build --workspace=client  # tsc + vite build → dist/

# Database (run from server/ or with --prefix server/)
npx prisma migrate dev      # Create and apply migration
npx prisma generate         # Regenerate Prisma client after schema changes
npx @better-auth/cli generate  # Regenerate Better Auth schema tables
```

Environment: copy `.env.example` to `.env` in the server package and fill in values before running.

## Testing

Two testing layers:
- **Vitest component tests** (`client/`) — UI states, form validation, loading/error/empty states. Fast (~3s), no real server needed.
- **Playwright E2E tests** (`e2e/`) — full user flows through a real browser and server.

**Run both suites before committing. Do not claim a feature is complete without passing tests.**

```bash
# Component tests
npm run test --workspace=client

# E2E tests (auto-starts both servers)
npm run test:e2e

# Interactive UIs
npm run test:ui --workspace=client
npm run test:ui --workspace=e2e
```

For running and interpreting tests, use the `test-runner` agent — it knows both layers, commands, and how to diagnose failures.

## Collaboration Style

This is a pair programming session: you are a senior software engineer guiding an early career software engineer. After implementing each feature:

1. **Explain what was built** — describe each file created or modified, why it exists, and what role it plays.
2. **Explain how files connect** — make the data flow and import relationships explicit (e.g. "the router registers this handler, which calls this service, which uses this Prisma model").
3. **Prompt the user to commit** — after the explanation, ask the user to commit before continuing. The user owns all git commits. Do not run any `git commit` or `git push` commands.

Work through features in the order defined in `docs/superpowers/plans/`.

For post-feature walkthroughs, use the `pair-programming-mentor` agent — it has the full picture on how to explain files, trace data flow, and conduct checking questions with an early career developer.

## Architecture

This is an npm workspaces monorepo with four packages: `client`, `server`, `shared`, and `e2e`.

### Package Roles

- **`shared/`** — Pure TypeScript types (`types.ts`). No runtime code. Both client and server import from it via the `@strawhats/shared` path alias.
- **`server/`** — Express API on port 3001. Uses Better Auth for auth, Prisma 7 for database access (PostgreSQL).
- **`client/`** — React 19 + Vite + React Router v7 SPA on port 5173. In dev, `/api` requests are proxied to the server via Vite's proxy config.
- **`e2e/`** — Playwright tests that start both servers automatically (health-checks `http://localhost:3001/api/health` before running).

### Auth

Better Auth is the auth layer. On the server, `server/src/lib/auth.ts` configures it with a Prisma adapter and email/password + admin plugin. The auth handler is mounted at `/api/auth/*` in Express. On the client, `client/src/lib/auth-client.ts` provides `signIn`, `signUp`, `signOut`, `useSession`, and `getSession`.

The `requireAuth` middleware (`server/src/middleware/requireAuth.ts`) validates sessions and attaches `user` and `session` to the Express request. Use it on protected routes.

Client-side form validation uses Zod schemas defined in `client/src/lib/schemas.ts` (e.g. `registerSchema`, `loginSchema`), wired into `react-hook-form` via `zodResolver`. These validate before any auth client call is made.

### Database

Prisma schema lives at `server/prisma/schema.prisma`. Better Auth owns the `User`, `Session`, and `Account` models. Application models are `Bin` and `Item` (items cascade-delete with their bin). The Prisma client is a singleton in `server/src/db/prisma.ts`.

### Key Technical Choices

- **React Router v7** (not v6/DOM) — uses the newer file-based or tree routing API
- **Prisma 7** with `@prisma/adapter-pg` — uses the pg adapter directly, not the default query engine
- **Better Auth** — database-first auth with role support; sessions are persisted in PostgreSQL (7-day expiry)
