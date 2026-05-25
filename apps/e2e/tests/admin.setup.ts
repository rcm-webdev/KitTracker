import { test as setup, expect } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";
import { Client } from "pg";

const adminAuthFile = path.join(__dirname, "../playwright/.auth/admin.json");

setup("authenticate admin", async ({ request }) => {
  // Load test env vars so DATABASE_URL points at strawhats_test, not the real DB.
  const testConfig = dotenv.config({ path: path.join(__dirname, "../../server/.env.test") });
  const dbUrl = testConfig.parsed?.DATABASE_URL ?? "postgresql://aokiji@localhost:5432/strawhats_test";

  const email = process.env.E2E_ADMIN_EMAIL ?? "admin@strawhats.test";
  const password = process.env.E2E_ADMIN_PASSWORD ?? "admin-password-123";

  await request.post("http://localhost:3001/api/auth/sign-up/email", {
    data: { email, password, name: "E2E Admin" },
  });

  // Sign up the bannable user before signing in as admin — Better Auth may
  // reject sign-up from an already-authenticated session context.
  const bannableEmail = process.env.E2E_BANNABLE_EMAIL ?? "bannable@strawhats.test";
  const bannablePassword = process.env.E2E_BANNABLE_PASSWORD ?? "bannable-password-123";
  await request.post("http://localhost:3001/api/auth/sign-up/email", {
    data: { email: bannableEmail, password: bannablePassword, name: "Bannable User" },
  });

  // Promote admin via direct SQL (avoids ESM/CJS import issues with server code)
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  await client.query('UPDATE "user" SET role = $1 WHERE email = $2', [
    "admin",
    email,
  ]);
  await client.end();

  // Sign in as admin and save the session
  const signInResponse = await request.post(
    "http://localhost:3001/api/auth/sign-in/email",
    { data: { email, password } }
  );
  expect(signInResponse.ok()).toBeTruthy();

  await request.storageState({ path: adminAuthFile });
});
