# KitTracker: Procedure Keeper

Supply tracking tool built for ophthalmic surgical teams. Replaces sticky notes and tribal knowledge with QR-labeled procedure kits, camera scanning, and role-scoped access so technicians can find what they need without interrupting anyone.

Kit Tracker

## Key Features

- Procedure kits tagged by surgeon, with role-scoped access so technicians only see and edit their assigned providers' kits
- QR code labels printed per kit; scanning opens a read-only supply sheet on any clinic tablet without requiring a login
- Full-text search across all kits and supplies
- Toast notifications on all create, edit, and auth actions via Sonner
- Role hierarchy: `admin` → `lead` → `technician` → `kiosk`, each with distinct create/edit/view permissions
- Admin panel for user management and surgeon assignment
- Email/password auth with 7-day persistent sessions

## Demo

Demo credentials are displayed on the sign-in page. A seed script loads 8 surgeon-tagged kits across two providers.


| Role                      | Email                           | Password       |
| ------------------------- | ------------------------------- | -------------- |
| Admin / Lead              | `clinic-lead@kittracker.clinic` | `DemoPass123!` |
| Technician (Dr. Eye only) | `eye1team@kittracker.clinic`    | `DemoPass123!` |
| Kiosk PIN                 | n/a                             | `88888888`     |


## Tech Stack

React
TypeScript
TailwindCSS
Vite
Express.js
Prisma
Postgres

Deployed to Railway via multi-stage Docker build. Express serves the compiled React SPA as static files, so the client and API share a single origin and port.

## Testing


| Layer     | Tool                           | Notes                                                  |
| --------- | ------------------------------ | ------------------------------------------------------ |
| Component | Vitest + React Testing Library | UI states, form validation, loading/error/empty states |
| E2E       | Playwright (Chromium)          | Full user flows through a real browser and server      |


## Design Decisions

**Session cookies over JWTs.** Better Auth persists sessions in PostgreSQL, so revocation is a single row delete with no token refresh logic to maintain. The tradeoff is a database read on every authenticated request, which is acceptable at clinic scale.

**Public kit pages behind a PIN, not a login.** Clinic tablets are shared devices. QR codes link to a read-only page anyone can view; a simple PIN unlocks the full app for that kit. This keeps the happy path frictionless while still gatekeeping writes.

**Role-scoped data at the API layer.** The server enforces provider scope on every query so technicians receive only their assigned kits regardless of what the client requests. Authorization logic lives in one place and privilege escalation requires a server change.

**Monorepo with npm workspaces.** `apps/client`, `apps/server`, and `apps/e2e` share a `packages/shared` type library so the client and server import the same TypeScript types without duplication or a publish step.

**Prisma 7 with the `pg` adapter.** Prisma 7 uses native database drivers instead of a sidecar binary. The `@prisma/adapter-pg` adapter removes the binary dependency and reduces cold-start overhead in containers.