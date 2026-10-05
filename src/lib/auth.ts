import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
};

// Returns the logged-in user, or sends them to the login page.
// getClaims verifies the login token locally with cryptography,
// which is much faster than asking Supabase's server on every page.
export async function requireUser(): Promise<CurrentUser> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    redirect("/login");
  }

  const metadata = (claims.user_metadata ?? {}) as Record<string, unknown>;

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : "",
    fullName: typeof metadata.full_name === "string" ? metadata.full_name : "",
  };
}