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
