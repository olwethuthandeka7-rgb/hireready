import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/lib/env";

// Pages that require the user to be logged in.
const PROTECTED_PATHS = ["/dashboard", "/cv", "/jobs"];

// Pages only logged-out users should see.
const AUTH_PATHS = ["/login", "/signup"];

function matches(pathname: string, paths: string[]) {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

// Runs before each request: refreshes the login session
// and redirects users away from pages they shouldn't see.
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Important: refreshes the session if it has expired. Do not remove.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Logged out and trying to open a private page → go to login,
  // remembering where they wanted to go.
  if (!user && matches(pathname, PROTECTED_PATHS)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return redirectWithCookies(url, response);
  }

  // Already logged in and opening login or sign-up → go to dashboard.
  // (The "check your email" page is still allowed.)
  if (
    user &&
    matches(pathname, AUTH_PATHS) &&
    pathname !== "/signup/check-email"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return redirectWithCookies(url, response);
  }

  return response;
}

// Keeps any refreshed session cookies when redirecting.
function redirectWithCookies(url: URL, response: NextResponse) {
  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}