export const roles = ["customer", "photographer", "admin"] as const;
export type Role = (typeof roles)[number];
export type UserStatus = "active" | "suspended" | "deleted";

export type Profile = {
  role: Role;
  status: UserStatus;
  full_name: string | null;
  phone?: string | null;
  locale: "mn" | "en";
};

/** True only for an active profile whose role is in `allowed`. Missing profile = no access. */
export function hasRole(profile: Pick<Profile, "role" | "status"> | null | undefined, allowed: readonly Role[]): boolean {
  if (!profile || profile.status !== "active") return false;
  return allowed.includes(profile.role);
}

export type PhotographerStatus = "pending" | "approved" | "rejected" | "suspended";

/** Only an active user with the photographer role AND an approved photographer profile may upload or sell. */
export function canSellPhotos(
  profile: Pick<Profile, "role" | "status"> | null | undefined,
  photographerStatus: PhotographerStatus | null | undefined,
): boolean {
  return hasRole(profile, ["photographer"]) && photographerStatus === "approved";
}

/** Parses the portfolio links textarea: one https URL per line, 1 to 5 links. Returns null if invalid. */
export function parsePortfolioUrls(text: string): string[] | null {
  const urls = text
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (urls.length < 1 || urls.length > 5) return null;
  for (const u of urls) {
    if (u.length > 500) return null;
    try {
      if (new URL(u).protocol !== "https:") return null;
    } catch {
      return null;
    }
  }
  return urls;
}

/** Accept only same-site relative paths, to stop open redirects via ?next=. */
export function safeNextPath(next: string | null | undefined, fallback: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
