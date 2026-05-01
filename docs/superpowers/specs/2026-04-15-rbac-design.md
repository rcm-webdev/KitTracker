# RBAC: Admin & User Role Design

**Date:** 2026-04-15
**Status:** Approved

## Overview

Two roles exist: `admin` and `user` (default). Better Auth's admin plugin already configures both. Admins have a separate experience from regular users — they manage accounts, not bins. Regular users see only their own bins, unchanged from the current behavior.

Admin accounts are seeded directly in the database. There is no UI to promote users to admin. This is intentional — admin is a highly privileged role and promotion is kept manual.

## Routing & Auth Flow

- After sign-in, if `session.user.role === "admin"`, redirect to `/admin/users`. If `user`, redirect to `/dashboard`.
- `ProtectedRoute` already supports `requireAdmin`. Admins hitting `/dashboard` are redirected to `/admin/users`. Regular users hitting `/admin/users` are redirected to `/dashboard`.
- The Login page redirect logic checks role after sign-in and routes accordingly.

No new auth infrastructure is needed — this is routing logic only.

## Server: Admin Routes

A new `server/src/routes/admin.ts` router, mounted at `/api/admin`.

A `requireAdmin` middleware extends `requireAuth` — validates session and additionally checks `user.role === "admin"`, returning 403 if not.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/users` | List all users with bin count and item count per user |
| `POST` | `/api/admin/users/:id/ban` | Deactivate user — calls `auth.api.banUser()`, invalidates sessions |
| `POST` | `/api/admin/users/:id/unban` | Reactivate user — calls `auth.api.unbanUser()` |
| `DELETE` | `/api/admin/users/:id` | Hard delete user — cascade deletes bins and items |

**Self-action protection:** All four endpoints return 400 if `req.params.id === req.user.id`.

Bin and item counts for the user list come from Prisma aggregation (`_count`) — no separate query needed.

## Client: Admin Dashboard

`/admin/users` — replaces the existing minimal `AdminUsers.tsx`.

### User Table

Columns: Email | Name | Role | Status | Joined | Actions

Status displays as "Active" or "Deactivated" based on Better Auth's `banned` field.

### Actions Per Row

- **Deactivate / Reactivate** — toggles ban state immediately. No confirmation modal. Label switches based on current status.
- **Delete** — opens a confirmation modal.

Actions are disabled for the currently signed-in admin's own row.

### Delete Confirmation Modal

Shows:
- The user's email and name
- "This user has X bins and Y items. Deleting their account is permanent and cannot be undone."
- A text input: "Type the user's email to confirm"
- Delete button — enabled only when the typed value matches the user's email exactly

### Navigation

The admin dashboard has no bin creation, no search, no QR scanner links — user management only. A sign-out button is present.

## What Is Not Built (Future Scope)

- **Admin promotion UI** — grant admin role via the dashboard. DB-only for now.
- **Inactivity deactivation** — auto-deactivate accounts after 3 months of inactivity. When this is built, a `lastActiveAt` field will be added to the User model and a background job will call the ban endpoint. The deactivate/reactivate infrastructure built here will be reused.

## Deactivation Strategy

Uses Better Auth's built-in `banUser` / `unbanUser` from the admin plugin. Banned sessions are automatically invalidated — no manual session cleanup needed. The "banned" label is internal only; the UI surfaces this as "Deactivated / Active".
