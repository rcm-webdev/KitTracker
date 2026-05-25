import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

// This setup project runs once before all tests.
// It signs in via the API (no UI needed), then saves the session cookie
// to playwright/.auth/user.json so every test starts already logged in.
setup("authenticate", async ({ request }) => {
  await request.post("http://localhost:3001/api/auth/sign-up/email", {
    data: {
      email: process.env.E2E_USER_EMAIL ?? "e2e@strawhats.test",
      password: process.env.E2E_USER_PASSWORD ?? "e2e-password-123",
      name: "E2E User",
    },
  });

  // Sign in and capture the session cookie
  const signInResponse = await request.post(
    "http://localhost:3001/api/auth/sign-in/email",
    {
      data: {
        email: process.env.E2E_USER_EMAIL ?? "e2e@strawhats.test",
        password: process.env.E2E_USER_PASSWORD ?? "e2e-password-123",
      },
    }
  );

  expect(signInResponse.ok()).toBeTruthy();

  // Persist cookies and localStorage so all tests start authenticated
  await request.storageState({ path: authFile });
});
