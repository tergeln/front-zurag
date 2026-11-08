import "server-only";
import { cookies } from "next/headers";

// Access codes a visitor has entered for private events, kept in an httpOnly
// cookie as {eventId: code}. The database checks each code against its hash.
const COOKIE = "zurag_event_codes";

export async function getEventCodes(): Promise<Record<string, string>> {
  try {
    const raw = (await cookies()).get(COOKIE)?.value;
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function rememberEventCode(eventId: string, code: string) {
  const codes = await getEventCodes();
  codes[eventId] = code.slice(0, 64);
  // Keep the cookie small: at most 20 events.
  const trimmed = Object.fromEntries(Object.entries(codes).slice(-20));
  (await cookies()).set(COOKIE, JSON.stringify(trimmed), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

// A random token that ties selfie-search matches to this browser (no account
// needed). The database stores only its hash and shows matched photos for 24 hours.
const SEARCH_COOKIE = "zurag_search";

export async function getSearchToken(): Promise<string> {
  const v = (await cookies()).get(SEARCH_COOKIE)?.value ?? "";
  return /^[0-9a-f]{64}$/.test(v) ? v : "";
}

/** Returns this browser's token, creating it on the first search. Route handlers and actions only. */
export async function ensureSearchToken(): Promise<string> {
  const existing = await getSearchToken();
  if (existing) return existing;
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  (await cookies()).set(SEARCH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return token;
}
