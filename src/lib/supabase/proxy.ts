import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/lib/env";

// Runs before each request to refresh the user's login session
// and keep the auth cookies up to date.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update the cookies on the incoming request...
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // ...and on the response sent back to the browser.
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Important: this call refreshes the session if it has expired.
  // Do not remove it.
  await supabase.auth.getUser();

  return response;
}