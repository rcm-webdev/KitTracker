import { resetDatabase } from "./db-helpers";

async function globalSetup(): Promise<void> {
  console.log("[global-setup] Resetting test database...");
  await resetDatabase();
  console.log("[global-setup] Done.");
}

export default globalSetup;
