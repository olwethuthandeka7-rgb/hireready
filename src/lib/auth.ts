import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Returns the logged-in user. If nobody is logged in,
// sends them to the login page instead.
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}