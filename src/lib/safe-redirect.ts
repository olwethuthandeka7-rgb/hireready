// Only allow redirects to pages on our own site.
// "/dashboard" is allowed; "https://evil.com" and "//evil.com" are not.
export function safeRedirectPath(
  path: string | null | undefined,
  fallback = "/dashboard",
) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }
  return path;
}