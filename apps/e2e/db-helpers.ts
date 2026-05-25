import { Client } from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

function getTestDatabaseUrl(): string {
  const parsed = dotenv.parse(
    fs.readFileSync(path.resolve(__dirname, "../server/.env.test"))
  );
  if (!parsed.DATABASE_URL) throw new Error("DATABASE_URL missing from server/.env.test");
  return parsed.DATABASE_URL;
}

export async function resetDatabase(): Promise<void> {
  const client = new Client({ connectionString: getTestDatabaseUrl() });
  await client.connect();
  try {
    // Explicit order (leaf → parent) + CASCADE for safety.
    // "user" is quoted — it's a PostgreSQL reserved word.
    await client.query(`
      TRUNCATE TABLE items, bins, session, account, verification, "user"
      RESTART IDENTITY CASCADE
    `);
  } finally {
    await client.end();
  }
}
