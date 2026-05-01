# Axios Migration Design

**Date:** 2026-04-20
**Status:** Approved

## Goal

Standardize all HTTP requests on axios. Replace native `fetch` usage in the client with a configured axios instance while keeping the existing public API surface (`apiFetch`, `apiFetchJson`) unchanged.

## Scope

- `client/src/lib/api.ts` — swap internals from `fetch` to axios
- `client/src/pages/AdminDashboard.tsx` — replace 2 raw `fetch()` calls with `apiFetch`

No other files need changes. All 7 callers of `apiFetchJson` and `apiFetch` are unaffected.

## Architecture

### Axios instance (`client/src/lib/api.ts`)

Create a single axios instance with shared config:

```ts
const axiosInstance = axios.create({
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
```

**`apiFetch`** — calls `axiosInstance.request(config)` and returns the axios response. Signature unchanged: `(path: string, options?: RequestInit) => Promise<AxiosResponse>`.

**`apiFetchJson<T>`** — calls `apiFetch`, returns `response.data`. Axios auto-parses JSON so no manual `.json()` call is needed. On error, catches `AxiosError` and extracts `error.response.data.error`, falling back to `HTTP ${status}`. Signature unchanged.

### AdminDashboard.tsx

Replace raw `fetch()` in `handleToggleBan` and `handleDelete` with `apiFetch`. Error handling logic stays the same.

## Error Handling

Axios throws on non-2xx responses by default. `apiFetchJson` catches `AxiosError` and surfaces the server error message consistently with the current behavior.

## Testing

Full Playwright E2E suite after implementation. No unit tests needed — the behavior is covered by existing integration tests.
