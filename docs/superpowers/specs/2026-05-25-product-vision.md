# Strawhats — Product Vision

**Date:** 2026-05-25  
**Status:** Active north star for UI copy, docs, and production-readiness work

## Mission

Centralize ophthalmic procedure supply tracking into a production inventory tool, replacing tribal knowledge and repeated staff interruptions with QR-labeled bins, camera scanning, and full-text search.

## Deployment context

Deployed and actively used in clinical operations as a procedural supply reference and inventory management system supporting day-to-day workflow execution.

## Problem we solve

| Today (without Strawhats) | With Strawhats |
|---|---|
| Staff ask colleagues where supplies live | Bins are labeled; scan or search finds them |
| Opening every cart/shelf to check contents | Bin detail shows items without physical hunt |
| Knowledge lives in people's heads | Location + contents are recorded and searchable |
| Interrupt-driven lookups during cases | Self-serve reference during workflow |

## Core capabilities (already built)

- **Bins** — named supply containers with clinical location (e.g. OR bay, prep room, storage)
- **Items** — supplies tracked inside each bin
- **Full-text search** — find any supply and see which bin and location it is in
- **QR labels** — print labels for physical bins; scan opens a **public kit page** (`/k/:id`) with a read-only supply sheet for clinic tablets, plus optional **tablet PIN** sign-in for staff mode in the full app
- **Camera scanner** — scan a label without typing
- **Auth & admin** — staff accounts with role-based admin for user management
- **Team access** — each user is assigned one or more surgeons (`assignedProviders`); leads create kits for their team, technicians edit team kits, kiosk tablets scan/view only

## Production UX bar

The interface should feel like clinical operations software, not a hobby project:

- Consistent **shadcn Form** + Zod validation on all bin/item flows (auth already uses this pattern)
- **App shell** with persistent navigation (dashboard, search, scan, admin)
- Copy and placeholders that reference **procedure areas and supply bins**, not consumer storage or collectibles
- Accessible labels, loading/submit states, and clear empty states

## Demo data

Run `npm run db:seed` from the repo root (after migrations). This creates:

- **User:** `clinic-lead@kittracker.clinic` / `DemoPass123!` (see `packages/shared/demo.ts`)
- **Clinic tablet (QR PIN):** `tablet@kittracker.clinic` / PIN `88888888` (see `packages/shared/kiosk.ts`)
- **Kits:** eight procedure kits, one per surgeon in `CLINIC_PROVIDERS` (Dr. Eye … Dr. Eye8), each tagged with that provider and stocked with sample supplies

Re-running the seed keeps the same user and replaces their kits — safe for refreshing a demo environment.

## Out of scope (for now)

- Barcode/UPC catalog integration
- EMR or inventory system integrations
- Photo attachments on items
- Lot/expiry tracking

## Terminology

| Term in app | Meaning |
|---|---|
| Procedure kit (bin) | Physical supply container for one in-clinic procedure setup, with a QR label |
| Location | Room or area where the kit is staged (OR, prep, sterile core, etc.) |
| Provider tag | Surgeon/provider name on a kit — filter the dashboard to pull every related kit before a case |
| Item | A supply on the kit’s list (shown first when a tech scans the QR code) |
