import { z } from "zod";

// Secret settings that must only ever be used on the server.
// Never import this file into a "use client" component.
const serverEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .startsWith("postgresql://", "DATABASE_URL must start with postgresql://"),
});

const result = serverEnvSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
});

if (!result.success) {
  throw new Error(
    "Missing or invalid server environment variables. Check your .env.local file against .env.example.\n" +
      z.prettifyError(result.error),
  );
}

export const serverEnv = result.data;