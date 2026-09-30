import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Loads .env.local the same way Next.js does.
loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing. Add it to .env.local.");
}

// The app uses Supabase's transaction pooler (port 6543).
// Migrations use the session pooler on the same server (port 5432),
// which supports everything migrations need.
const migrationUrl = databaseUrl.replace(":6543/", ":5432/");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: migrationUrl },
  // Only manage our own tables. Supabase's built-in ones (like auth) are left alone.
  schemaFilter: ["public"],
  strict: true,
  verbose: true,
});