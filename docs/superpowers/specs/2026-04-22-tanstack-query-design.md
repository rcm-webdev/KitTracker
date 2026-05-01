# TanStack Query Migration Design

**Date:** 2026-04-22
**Status:** Approved

## Context

The client currently fetches all data using `useEffect` + local `useState` for `loading`, `error`, and `data` in every page component. This pattern has three problems:

1. **No caching** — navigating away and back always triggers a new network request, even for data that hasn't changed.
2. **No shared state** — BinDetail, BinEdit, and BinLabel all fetch the same bin independently. Three requests, no coordination.
3. **Duplicated boilerplate** — every page maintains the same `setLoading(true)` / `try/catch` / `finally` cycle. Mutations require manual refetch calls after success.

TanStack Query replaces this with a cache-backed data layer. Reads (`useQuery`) check the cache before hitting the network. Writes (`useMutation`) invalidate specific cache entries on success, triggering automatic refetches only where needed.

---

## Architecture

### Approach: Custom hooks per entity

Each data entity gets its own hook file in `client/src/hooks/`. Pages call hooks, not the API directly. The hook owns the query key, the fetch function, and the cache invalidation logic.

This keeps components clean (they describe *what* they need, not *how* to fetch it) and ensures query keys and fetch logic live in one place — a typo or endpoint change only needs fixing once.

---

## Implementation

### 1. Installation

Install into the `client` workspace:

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools --workspace=client
```

### 2. QueryClient setup — `client/src/main.tsx`

Create one `QueryClient` at the top of the app and wrap `<App>` with `<QueryClientProvider>`. Every `useQuery` call anywhere in the tree shares this single cache.

Configure `retry: 1` (down from the default of 3) so failed requests surface quickly during development rather than retrying silently.

```tsx
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1 } } })

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools /> {/* stripped from production build automatically */}
  </QueryClientProvider>
)
```

`ReactQueryDevtools` adds a floating panel in development that shows every cached query, its state (`fresh`, `stale`, `fetching`, `error`), and lets you manually invalidate or refetch. Use it to verify cache hits during manual testing.

### 3. Query keys — `client/src/lib/queryKeys.ts`

Centralise all query keys in one file. TanStack Query uses prefix matching for invalidation — `['bins']` invalidates both the list and any `['bins', id]` detail entries.

```ts
export const queryKeys = {
  bins: {
    all: ['bins'] as const,
    filtered: (location: string) => ['bins', { location }] as const,
    detail: (id: string) => ['bins', id] as const,
  },
  search: (query: string) => ['search', query] as const,
  admin: {
    users: ['admin', 'users'] as const,
  },
}
```

Never inline query key strings in hook files — always import from here.

### 4. Custom hooks

#### `client/src/hooks/useBins.ts`
- `useBins(location?)` — fetches `GET /api/bins` with optional location filter. Key: `queryKeys.bins.all` or `queryKeys.bins.filtered(location)`.
- `useCreateBin()` — `POST /api/bins`. On success, invalidates `queryKeys.bins.all`.
- `useDeleteBin()` — `DELETE /api/bins/:id`. On success, invalidates `queryKeys.bins.all`.

#### `client/src/hooks/useBin.ts`
- `useBin(id)` — fetches `GET /api/bins/:id`. Key: `queryKeys.bins.detail(id)`. Shared across BinDetail, BinEdit, BinLabel — all three hit the cache on navigation between them.
- `useUpdateBin(id)` — `PUT /api/bins/:id`. On success, invalidates `queryKeys.bins.detail(id)` and `queryKeys.bins.all` so the Dashboard reflects the updated name/location.

#### `client/src/hooks/useItems.ts`
Items are not fetched independently — they come embedded in the bin response. These hooks only cover mutations:
- `useAddItem(binId)` — `POST /api/bins/:id/items`. On success, invalidates `queryKeys.bins.detail(binId)`.
- `useDeleteItem(binId)` — `DELETE /api/bins/:id/items/:itemId`. On success, invalidates `queryKeys.bins.detail(binId)`.

#### `client/src/hooks/useSearch.ts`
- `useSearch(query)` — fetches `GET /api/search?q=query`. Key: `queryKeys.search(query)`. Uses `enabled: query.length > 0` to skip the fetch on an empty string — prevents a spurious request on page load.

#### `client/src/hooks/useAdminUsers.ts`
- `useAdminUsers()` — fetches `GET /api/admin/users`. Key: `queryKeys.admin.users`.
- `useBanUser()` — `POST /api/admin/users/:id/ban` or `/unban`. On success, invalidates `queryKeys.admin.users`.
- `useDeleteUser()` — `DELETE /api/admin/users/:id`. On success, invalidates `queryKeys.admin.users`.

### 5. Page migration

Each page drops its `useState(loading/error/data)` + `useEffect` block and calls the relevant hook. Every page gains typed `isPending`, `isError`, `error`, and `data` from the hook return value.

| Page | Hooks used | Key change |
|---|---|---|
| `Dashboard.tsx` | `useBins(location)` | Location filter is part of the query key — changing it auto-fetches |
| `BinNew.tsx` | `useCreateBin()` | `mutation.mutate(data)` replaces manual POST + navigate |
| `BinDetail.tsx` | `useBin(id)`, `useAddItem(id)`, `useDeleteItem(id)` | No manual refetch after item add/delete |
| `BinEdit.tsx` | `useBin(id)`, `useUpdateBin(id)` | Loads from cache if already visited BinDetail |
| `BinLabel.tsx` | `useBin(id)` | Cache hit — no extra request if bin already loaded |
| `Search.tsx` | `useSearch(query)` | Repeated queries hit cache; `enabled` guards empty input |
| `AdminDashboard.tsx` | `useAdminUsers()`, `useBanUser()`, `useDeleteUser()` | Ban/delete triggers automatic list refetch via invalidation |

`AdminUsers.tsx` is not connected to any route and will not be migrated (dead code).

---

## Error handling

Components read `isError` and `error` from hook return values:

```tsx
const { data: bins, isPending, isError, error } = useBins()
if (isPending) return <SkeletonList />
if (isError) return <p role="alert" style={{ color: 'red' }}>{error.message}</p>
```

`isPending` is true only during the first fetch. `isFetching` is true during any background refetch (useful for showing a subtle indicator without blocking the UI). For mutations, `mutation.isPending` covers the in-flight write.

---

## Test isolation (no dev data)

The E2E test suite is already fully isolated from the development environment:

- `e2e/playwright.config.ts` reads exclusively from `server/.env.test` — the dev `server/.env` is never loaded
- `server/.env.test` points to `strawhats_test` database, completely separate from the dev database
- `e2e/global-setup.ts` resets `strawhats_test` before every test run
- The test server starts with `reuseExistingServer: false` — it cannot accidentally reuse a running dev server

The TanStack Query migration requires no test changes. The E2E tests operate through the browser/HTTP layer, so swapping `useEffect` for `useQuery` is invisible to them.

---

## Verification

1. Run `npm run dev:server` + `npm run dev:client` and manually visit each page — use ReactQueryDevtools to confirm queries show as `fresh` after first load and `stale` after the configured stale time.
2. Navigate Dashboard → BinDetail → BinEdit — confirm BinEdit loads instantly from cache (no network request in DevTools).
3. Add an item in BinDetail — confirm the item list updates without a manual page reload.
4. Run the full E2E suite: `npm run test:e2e`. All existing tests must pass.

---

## Files to create

- `client/src/lib/queryKeys.ts`
- `client/src/hooks/useBins.ts`
- `client/src/hooks/useBin.ts`
- `client/src/hooks/useItems.ts`
- `client/src/hooks/useSearch.ts`
- `client/src/hooks/useAdminUsers.ts`

## Files to modify

- `client/package.json` — add `@tanstack/react-query` and `@tanstack/react-query-devtools`
- `client/src/main.tsx` — wrap app with `QueryClientProvider`
- `client/src/pages/Dashboard.tsx`
- `client/src/pages/BinNew.tsx`
- `client/src/pages/BinDetail.tsx`
- `client/src/pages/BinEdit.tsx`
- `client/src/pages/BinLabel.tsx`
- `client/src/pages/Search.tsx`
- `client/src/pages/AdminDashboard.tsx`
