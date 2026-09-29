import { z } from "zod";

// Describes exactly which public environment variables the app needs
// and what they must look like.
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

// Next.js only includes public env variables in browser code when they
// are written out in full like this, so we list each one explicitly.
const result = publicEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});

if (!result.success) {
  throw new Error(
    "Missing or invalid environment variables. Check your .env.local file against .env.example.\n" +
      z.prettifyError(result.error),
  );
}

export const publicEnv = result.data;