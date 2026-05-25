import { test, expect } from "../fixtures";

test.describe("Admin API", () => {
  test.describe("GET /api/admin/users", () => {
    test("returns 401 for unauthenticated requests", async ({ playwright }) => {
      // Explicitly empty storageState — without this, Playwright inherits
      // the chromium project's default storageState (user.json).
      const ctx = await playwright.request.newContext({
        baseURL: "http://localhost:3001",
        storageState: { cookies: [], origins: [] },
      });
      const response = await ctx.get("/api/admin/users");
      expect(response.status()).toBe(401);
      await ctx.dispose();
    });

    test("returns 403 for regular user", async ({ apiContext }) => {
      const response = await apiContext.get("/api/admin/users");
      expect(response.status()).toBe(403);
    });

    test("returns user list with counts for admin", async ({ adminApiContext }) => {
      const response = await adminApiContext.get("/api/admin/users");
      expect(response.ok()).toBeTruthy();
      const users = await response.json();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
      const user = users[0];
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("banned");
      expect(user).toHaveProperty("binCount");
      expect(user).toHaveProperty("itemCount");
      expect(typeof user.binCount).toBe("number");
      expect(typeof user.itemCount).toBe("number");
    });
  });

  test.describe("POST /api/admin/users/:id/ban and unban", () => {
    test("returns 403 for regular user", async ({ apiContext, adminApiContext }) => {
      const usersResponse = await adminApiContext.get("/api/admin/users");
      const users = await usersResponse.json();
      // Use the bannable user so we don't affect the e2e user's session
      const bannableEmail = process.env.E2E_BANNABLE_EMAIL ?? "bannable@strawhats.test";
      const regularUser = users.find((u: { email: string }) => u.email === bannableEmail);
      expect(regularUser).toBeDefined();

      const response = await apiContext.post(`/api/admin/users/${regularUser.id}/ban`);
      expect(response.status()).toBe(403);
    });

    test("admin can ban and unban a user", async ({ adminApiContext }) => {
      const usersResponse = await adminApiContext.get("/api/admin/users");
      const users = await usersResponse.json();
      // Use the dedicated bannable user — banning deletes sessions, which would
      // invalidate apiContext for other tests if we used the e2e user.
      const bannableEmail = process.env.E2E_BANNABLE_EMAIL ?? "bannable@strawhats.test";
      const regularUser = users.find((u: { email: string }) => u.email === bannableEmail);
      expect(regularUser).toBeDefined();

      // Ban
      const banResponse = await adminApiContext.post(
        `/api/admin/users/${regularUser.id}/ban`
      );
      expect(banResponse.ok()).toBeTruthy();

      // Confirm banned
      const afterBan = await adminApiContext.get("/api/admin/users");
      const afterBanUsers = await afterBan.json();
      const banned = afterBanUsers.find((u: { id: string }) => u.id === regularUser.id);
      expect(banned.banned).toBe(true);

      // Unban
      const unbanResponse = await adminApiContext.post(
        `/api/admin/users/${regularUser.id}/unban`
      );
      expect(unbanResponse.ok()).toBeTruthy();

      // Confirm unbanned
      const afterUnban = await adminApiContext.get("/api/admin/users");
      const afterUnbanUsers = await afterUnban.json();
      const unbanned = afterUnbanUsers.find((u: { id: string }) => u.id === regularUser.id);
      expect(unbanned.banned).toBe(false);
    });

    test("admin cannot ban themselves", async ({ adminApiContext }) => {
      const meResponse = await adminApiContext.get("/api/admin/users");
      const users = await meResponse.json();
      const adminUser = users.find((u: { email: string }) => u.email === "admin@strawhats.test");
      expect(adminUser).toBeDefined();

      const response = await adminApiContext.post(`/api/admin/users/${adminUser.id}/ban`);
      expect(response.status()).toBe(400);
    });
  });

  test.describe("DELETE /api/admin/users/:id", () => {
    test("returns 403 for regular user", async ({ apiContext, adminApiContext }) => {
      const usersResponse = await adminApiContext.get("/api/admin/users");
      const users = await usersResponse.json();
      const bannableEmail = process.env.E2E_BANNABLE_EMAIL ?? "bannable@strawhats.test";
      const regularUser = users.find((u: { email: string }) => u.email === bannableEmail);

      const response = await apiContext.delete(`/api/admin/users/${regularUser.id}`);
      expect(response.status()).toBe(403);
    });

    test("admin cannot delete themselves", async ({ adminApiContext }) => {
      const usersResponse = await adminApiContext.get("/api/admin/users");
      const users = await usersResponse.json();
      const adminUser = users.find((u: { email: string }) => u.email === "admin@strawhats.test");

      const response = await adminApiContext.delete(`/api/admin/users/${adminUser.id}`);
      expect(response.status()).toBe(400);
    });
  });

  test.describe("ban invalidates session", () => {
    test("banned user cannot access protected routes", async ({ adminApiContext, playwright }) => {
      // Use the dedicated bannable user to avoid invalidating the e2e user's session
      const usersResponse = await adminApiContext.get("/api/admin/users");
      const users = await usersResponse.json();
      const bannableEmail = process.env.E2E_BANNABLE_EMAIL ?? "bannable@strawhats.test";
      const regularUser = users.find((u: { email: string }) => u.email === bannableEmail);
      expect(regularUser).toBeDefined();

      // Sign in as the bannable user to get a fresh session
      const userCtx = await playwright.request.newContext({
        baseURL: "http://localhost:3001",
        storageState: { cookies: [], origins: [] },
      });
      await userCtx.post("/api/auth/sign-in/email", {
        data: {
          email: bannableEmail,
          password: process.env.E2E_BANNABLE_PASSWORD ?? "bannable-password-123",
        },
      });

      // Verify the user can access bins before ban
      const beforeBan = await userCtx.get("/api/bins");
      expect(beforeBan.ok()).toBeTruthy();

      // Ban the user
      await adminApiContext.post(`/api/admin/users/${regularUser.id}/ban`);

      // After ban, the user's sessions are deleted — existing session cookie should fail
      const afterBan = await userCtx.get("/api/bins");
      expect(afterBan.status()).toBe(401);

      await userCtx.dispose();

      // Restore: unban so other tests still work
      await adminApiContext.post(`/api/admin/users/${regularUser.id}/unban`);
    });
  });
});
