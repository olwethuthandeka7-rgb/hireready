import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { serverEnv } from "@/lib/server-env";

// While developing, Next.js reloads code often. Reusing one connection
// stops us from opening a new database connection on every reload.
const globalForDb = globalThis as unknown as {
  postgresClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.postgresClient ??
  // prepare: false is required by Supabase's transaction pooler.
  postgres(serverEnv.DATABASE_URL, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb.postgresClient = client;
}

export const db = drizzle({ client });