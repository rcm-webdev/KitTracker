import { resetDatabase } from "./db-helpers";

async function globalTeardown(): Promise<void> {
  console.log("[global-teardown] Cleaning test database...");
  await resetDatabase();
  console.log("[global-teardown] Done.");
}

export default globalTeardown;
