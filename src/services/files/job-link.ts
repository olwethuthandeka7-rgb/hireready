import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_PAGE_BYTES = 2 * 1024 * 1024; // 2MB
const TIMEOUT_MS = 10_000; // 10 seconds
const MAX_REDIRECTS = 3;
const MAX_TEXT_LENGTH = 30_000;

// An error whose message is safe and helpful to show the user.
export class JobLinkError extends Error {}

// Only plain web links, with no usernames or passwords inside them.
export function parseJobUrl(value: string): URL | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

// True for addresses inside private networks or this computer,
// which our server must never be tricked into visiting (SSRF protection).
export function isPrivateAddress(address: string): boolean {
  const lower = address.toLowerCase();

  if (isIP(lower) === 4) {
    const [a, b] = lower.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      a >= 224
    );
  }

  if (lower.startsWith("::ffff:")) {
    return isPrivateAddress(lower.slice(7));
  }

  return (
    lower === "::" ||
    lower === "::1" ||
    lower.startsWith("fc") ||
    lower.startsWith("fd") ||
    lower.startsWith("fe80")
  );
}

const BLOCKED_LINK_MESSAGE =
  "We can't open that link. Paste the job post's text instead.";

// Looks up where a link really points before visiting it.
async function assertPublicHost(url: URL) {
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();

  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    throw new JobLinkError(BLOCKED_LINK_MESSAGE);
  }

  let addresses: string[];
  try {
    addresses = isIP(host)
      ? [host]
      : (await lookup(host, { all: true })).map((entry) => entry.address);
  } catch {
    throw new JobLinkError(
      "We couldn't find that website. Check the link, or paste the job post's text instead.",
    );
  }

  if (addresses.length === 0 || addresses.some(isPrivateAddress)) {
    throw new JobLinkError(BLOCKED_LINK_MESSAGE);
  }
}

// Turns a web page into readable text: removes scripts, styles and tags.
// Each list item starts on a new line with a dash.
export function htmlToText(html: string) {
  return html
    .replace(/<(script|style|noscript|svg|head)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/(p|div|h[1-6]|tr|section|article|ul|ol)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Reads at most maxBytes, so a huge page can't overload our server.
async function readLimited(response: Response, maxBytes: number) {
  const reader = response.body?.getReader();
  if (!reader) return "";

  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      break;
    }
    chunks.push(value);
  }

  return new TextDecoder().decode(Buffer.concat(chunks));
}

export async function fetchJobPostText(rawUrl: string): Promise<string> {
  const firstUrl = parseJobUrl(rawUrl);
  if (!firstUrl) {
    throw new JobLinkError(
      "That doesn't look like a web link. It should start with https://",
    );
  }

  let url: URL = firstUrl;

  // Redirects are followed by hand so every new address gets checked too.
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
    await assertPublicHost(url);

    let response: Response;
    try {
      response = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; HireReady/1.0)",
          Accept: "text/html,text/plain",
        },
      });
    } catch {
      throw new JobLinkError(
        "That page took too long to respond or couldn't be reached. Paste the job post's text instead.",
      );
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      const nextUrl = location
        ? parseJobUrl(new URL(location, url).toString())
        : null;
      if (!nextUrl) {
        throw new JobLinkError(BLOCKED_LINK_MESSAGE);
      }
      url = nextUrl;
      continue;
    }

    if (!response.ok) {
      throw new JobLinkError(
        "We couldn't open that page. Some job sites only show posts to people who are logged in. Paste the job post's text instead.",
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("text/plain")
    ) {
      throw new JobLinkError(
        "That link isn't a web page we can read. If it's a PDF or an image, download it and upload it instead.",
      );
    }

    const body = await readLimited(response, MAX_PAGE_BYTES);
    const text = contentType.includes("text/html")
      ? htmlToText(body)
      : body.trim();

    if (text.length < 200) {
      throw new JobLinkError(
        "We couldn't find the job details on that page. Paste the job post's text instead.",
      );
    }

    return text.slice(0, MAX_TEXT_LENGTH);
  }

  throw new JobLinkError(
    "That link redirected too many times. Paste the job post's text instead.",
  );
}