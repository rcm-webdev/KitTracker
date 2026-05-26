# KitTracker: Ophthalmic Supply Inventory

Supply tracking tool built for ophthalmic surgical teams. Replaces sticky notes and tribal knowledge with QR-labeled procedure kits, camera scanning, and role-scoped access, so technicians can find what they need without interrupting anyone.

---

## Key Features

- Procedure kits tagged by surgeon, with role-scoped access so technicians only see and edit their assigned providers' kits
- QR code labels printed per kit; scanning opens a read-only supply sheet on any clinic tablet without requiring a login
- Full-text search across all kits and supplies
- Role hierarchy: `admin` → `lead` → `technician` → `kiosk` , each with distinct create/edit/view permissions
- Admin panel for user management and surgeon assignment
- Email/password auth with 7-day persistent sessions

---

## Demo Account

```bash
docker compose up --build
docker compose --profile seed run --rm seed
```

| Role | Email | Password |
|------|-------|----------|
| Admin / Lead | `clinic-lead@kittracker.clinic` | `DemoPass123!` |
| Technician (Dr. Eye only) | `eye1team@kittracker.clinic` | `DemoPass123!` |
| Kiosk PIN | n/a | `88888888` |

The seed creates 8 surgeon-tagged kits. QR codes on each kit link to `/k/:id`, a public supply sheet staff can open on a tablet.

---

## Tech Stack

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

---

## Testing

| Layer | Tool | Notes |
|---|---|---|
| Component | Vitest + React Testing Library | UI states, form validation, loading/error/empty states |
| E2E | Playwright (Chromium) | Full user flows through a real browser and server; auto-starts both servers |

---

## Design Decisions

**Session cookies over JWTs**
Better Auth persists sessions in PostgreSQL, so revocation is a single row delete and there is no token refresh logic to maintain. The tradeoff is a database read on every authenticated request, which is acceptable at clinic scale and avoids the class of bugs that come from long-lived tokens.

**Public kit pages behind a PIN, not a login**
Clinic tablets are shared devices. Requiring staff to log in and out during a procedure would create friction and defeat the purpose. QR codes link to a read-only page anyone can view; a simple PIN unlocks the full app for that kit. This keeps the happy path frictionless while still gatekeeping writes.

**Role-scoped data at the API layer**
Technicians are assigned to specific surgeons. Rather than filtering on the client, the server enforces provider scope on every query; technicians receive only their assigned kits regardless of what the client requests. This makes privilege escalation harder and keeps authorization logic in one place.

**Monorepo with npm workspaces**
`apps/client`, `apps/server`, and `apps/e2e` share a single `node_modules` and a `packages/shared` type library. Both the client and server import the same TypeScript types without duplication or a publish step. The tradeoff is added monorepo tooling complexity, which is managed by keeping the workspace structure flat.

**Containerized deployment via multi-stage Docker + nginx**
The builder stage compiles both the React SPA and Express server; the runtime stage copies only compiled artifacts and production dependencies. nginx serves the static client and proxies `/api/*` to Express on the same origin, so Better Auth session cookies work without cross-origin configuration. The tradeoff is added build complexity, but it eliminates environment drift and makes the app portable across hosting platforms.

**Prisma 7 with the `pg` adapter**
Prisma 7 ships with a new query engine that uses native database drivers instead of a sidecar binary. Using `@prisma/adapter-pg` directly removes the binary dependency and reduces cold-start overhead in containers. The tradeoff is that the adapter API is newer and has a smaller community surface area than the default engine.
