import { z } from "zod";

// Secret settings that must only ever be used on the server.
// Never import this file into a "use client" component.
const serverEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .startsWith("postgresql://", "DATABASE_URL must start with postgresql://"),
  AI_API_KEY: z
    .string()
    .min(1, "AI_API_KEY is missing. Add your Gemini API key to .env.local."),
  // Which AI model to use. Optional: falls back to a fast, free-tier model.
  AI_MODEL: z.string().min(1).default("gemini-3.5-flash"),
  // Used automatically when the main model is busy or overloaded.
  AI_BACKUP_MODEL: z.string().min(1).default("gemini-3.5-flash-lite"),
});

const result = serverEnvSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  AI_API_KEY: process.env.AI_API_KEY,
  AI_MODEL: process.env.AI_MODEL || undefined,
  AI_BACKUP_MODEL: process.env.AI_BACKUP_MODEL || undefined,
});

if (!result.success) {
  throw new Error(
    "Missing or invalid server environment variables. Check your .env.local file against .env.example.\n" +
      z.prettifyError(result.error),
  );
}

export const serverEnv = result.data;