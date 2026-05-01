# Axios Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all native `fetch` usage in the client with a configured axios instance, keeping the existing `apiFetch` / `apiFetchJson` public API surface unchanged.

**Architecture:** A single axios instance in `api.ts` holds shared config (`withCredentials`, `Content-Type`). `apiFetch` maps `RequestInit` options to axios config internally. `apiFetchJson<T>` extracts `response.data` and catches `AxiosError` for consistent error messages. Two raw `fetch()` calls in `AdminDashboard.tsx` are replaced with `apiFetch`.

**Tech Stack:** axios, TypeScript, React, Playwright (E2E tests only — no unit tests)

---

### Task 1: Install axios

**Files:**
- Modify: `client/package.json`

- [ ] **Step 1: Install axios in the client workspace**

```bash
npm install axios --workspace=client
```

Expected output: `added 1 package` (or similar) with no errors.

- [ ] **Step 2: Verify it appears in client/package.json**

```bash
cat client/package.json | grep axios
```

Expected: `"axios": "^1.x.x"` under `dependencies`.

- [ ] **Step 3: Commit**

```bash
git add client/package.json package-lock.json
git commit -m "chore: add axios to client dependencies"
```

---

### Task 2: Rewrite `api.ts` to use axios

**Files:**
- Modify: `client/src/lib/api.ts`

- [ ] **Step 1: Verify current E2E baseline passes**

```bash
npm run test:e2e
```

Expected: all tests pass. If any fail, stop and investigate before continuing.

- [ ] **Step 2: Replace the contents of `client/src/lib/api.ts`**

```ts
import axios, { AxiosError, type AxiosResponse } from "axios";

const axiosInstance = axios.create({
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<AxiosResponse> {
  const { body, method = "GET", headers } = options;
  return axiosInstance.request({
    url: path,
    method,
    data: body,
    headers: headers as Record<string, string> | undefined,
  });
}

export async function apiFetchJson<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const res = await apiFetch(path, options);
    return res.data as T;
  } catch (err) {
    if (err instanceof AxiosError) {
      const message =
        err.response?.data?.error ?? `HTTP ${err.response?.status ?? "unknown"}`;
      throw new Error(message);
    }
    throw err;
  }
}
```

- [ ] **Step 3: Run E2E tests to verify nothing broke**

```bash
npm run test:e2e
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/api.ts
git commit -m "feat: migrate api.ts internals from fetch to axios"
```

---

### Task 3: Replace raw `fetch()` calls in `AdminDashboard.tsx`

**Files:**
- Modify: `client/src/pages/AdminDashboard.tsx`

- [ ] **Step 1: Update the import to include `apiFetch`**

Find the current import at line 2:

```ts
import { apiFetchJson } from "../lib/api";
```

Replace with:

```ts
import { apiFetch, apiFetchJson } from "../lib/api";
```

- [ ] **Step 2: Replace the raw `fetch` in `handleToggleBan`**

Find:

```ts
const response = await fetch(`/api/admin/users/${user.id}/${action}`, {
  method: "POST",
  credentials: "include",
});
if (!response.ok) {
  const body = await response.json();
  throw new Error(body.error ?? "Action failed");
}
```

Replace with:

```ts
await apiFetch(`/api/admin/users/${user.id}/${action}`, {
  method: "POST",
});
```

Note: `apiFetchJson` / `apiFetch` already throw on non-2xx via axios, so the manual `if (!response.ok)` check is no longer needed. The `catch (e)` block in `handleToggleBan` will still catch the thrown error.

- [ ] **Step 3: Replace the raw `fetch` in `handleDelete`**

Find:

```ts
const response = await fetch(`/api/admin/users/${user.id}`, {
  method: "DELETE",
  credentials: "include",
});
if (!response.ok) {
  const body = await response.json();
  throw new Error(body.error ?? "Delete failed");
}
```

Replace with:

```ts
await apiFetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
```

- [ ] **Step 4: Run E2E tests**

```bash
npm run test:e2e
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/AdminDashboard.tsx
git commit -m "fix: replace raw fetch calls in AdminDashboard with apiFetch"
```
