# UI/UX Improvements Design

**Date:** 2026-05-14 (updated 2026-05-25)  
**Product vision:** See `2026-05-25-product-vision.md` — ophthalmic procedure supply inventory for clinical operations.  
**Scope:** Navigation shell, dashboard layout, form consistency

## Overview

Three focused UX improvements to the existing app while preserving its minimalist aesthetic:

1. **App Shell** — persistent sidebar navigation wrapping all protected routes
2. **Dashboard Layout** — stacked structure with header, search, location filter chips, and bin grid
3. **Form Consistency** — all bin/item forms migrated to shadcn Form + react-hook-form + Zod

Implementation follows a shell-first order: the sidebar layout wrapper is the structural dependency that the other changes slot into.

---

## 1. App Shell & Sidebar

### Component

A new `AppLayout` component wraps all protected routes in `App.tsx`. Public routes (`/login`, `/register`) are unaffected.

### Sidebar structure

- **Logo/wordmark** at the top: "STRAWHATS"
- **Nav items** (Lucide icons, no emojis):
  - Dashboard — `LayoutDashboard`
  - Search — `Search`
  - Scan QR — `ScanLine`
  - Users *(admin only, rendered conditionally based on role)* — `Users`
- **User section** at the bottom: display name + role label + sign-out icon button (`LogOut`)
- Active route highlighted via React Router `useLocation`

### Implementation

- Uses shadcn `Sidebar` component installed via shadcn MCP
- Admin section visibility controlled by reading `session.user.role` from `useSession()`
- Sign-out calls `authClient.signOut()` then redirects to `/login`
- No collapse behaviour required for initial implementation — fixed width sidebar

### Files affected

| File | Change |
|------|--------|
| `client/src/components/AppLayout.tsx` | New — sidebar + content area shell |
| `client/src/App.tsx` | Wrap protected routes with `AppLayout` |
| `client/src/components/ui/sidebar.tsx` | New — installed via shadcn MCP |

---

## 2. Dashboard Layout

### Structure (top to bottom)

1. **Page header row** — "My Bins" title with subtitle (`N bins across N locations`), "New Bin" button (primary) aligned right
2. **Search bar** — full-width shadcn `Input` with `Search` Lucide icon; on submit navigates to `/search?q=...`
3. **Location filter chips** — shadcn `Badge` components rendered as toggles; "All" selected by default; clicking a chip filters the bin grid client-side
4. **Bin grid** — responsive CSS grid (3 columns desktop, 2 tablet, 1 mobile); each bin rendered as a shadcn `Card`
5. **Empty state** — when no bins exist (or no bins match active filter), show centered message with `PackageOpen` Lucide icon and a "Create your first bin" CTA button

### Bin card

Keeps existing data: name, location badge, description, item count. Adds a consistent edit icon button (`Pencil`) linking to `/bins/:id/edit`.

### Files affected

| File | Change |
|------|--------|
| `client/src/pages/Dashboard.tsx` | Refactor layout to stacked structure |
| `client/src/components/BinCard.tsx` | Add edit icon button, standardise card structure using shadcn `Card` |
| `client/src/components/ui/badge.tsx` | New — installed via shadcn MCP (used for location chips and location labels) |
| `client/src/components/ui/card.tsx` | New — installed via shadcn MCP |

---

## 3. Form Consistency

All bin and item forms are migrated to use `FormField` + `FormItem` + `FormLabel` + `FormControl` + `FormMessage` from shadcn, backed by Zod schemas and wired via `zodResolver`.

### New Zod schemas (`client/src/lib/schemas.ts`)

```ts
export const binSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().optional(),
})

export const itemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
})
```

### Per-form changes

| Form | File | Changes |
|------|------|---------|
| Create bin | `BinNew.tsx` | Replace raw inputs with shadcn `FormField`; add Cancel button (navigates back); disable submit while in flight |
| Edit bin | `BinEdit.tsx` | Same as BinNew; pre-populate fields from existing bin data |
| Add item | `BinDetail.tsx` | Inline item form gets same treatment; name required, description optional |
| Login | `LoginForm.tsx` | Already correct — no changes |
| Register | `RegisterForm.tsx` | Already correct — no changes |

### Submit button behaviour

- Disabled while `isSubmitting` is true (react-hook-form)
- Shows a `Loader2` Lucide icon spinning alongside label text
- Cancel button on BinNew/BinEdit navigates back without saving

---

## Architecture & Data Flow

```
App.tsx
  └── AppLayout (sidebar + {children})
        ├── /dashboard        → Dashboard.tsx
        │     ├── BinCard × N (shadcn Card)
        │     └── location chips (shadcn Badge)
        ├── /bins/new         → BinNew.tsx (shadcn Form + binSchema)
        ├── /bins/:id         → BinDetail.tsx (shadcn Form + itemSchema)
        ├── /bins/:id/edit    → BinEdit.tsx (shadcn Form + binSchema)
        ├── /search           → Search.tsx
        ├── /scan             → Scanner.tsx
        └── /admin/users      → AdminDashboard.tsx
```

Public routes (`/login`, `/register`) render outside `AppLayout` — no sidebar.

---

## Out of Scope

- Toast/confirmation feedback for mutations (not selected as a focus area)
- Loading and empty states beyond the dashboard empty state
- AdminDashboard table refactor
- BinLabel / PrintLabel changes
- Mobile sidebar collapse behaviour
