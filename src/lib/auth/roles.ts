export const roles = ["customer", "photographer", "admin"] as const;
export type Role = (typeof roles)[number];
export type UserStatus = "active" | "suspended" | "deleted";

export type Profile = {
  role: Role;
  status: UserStatus;
  full_name: string | null;
  locale: "mn" | "en";
};

/** True only for an active profile whose role is in `allowed`. Missing profile = no access. */
export function hasRole(profile: Pick<Profile, "role" | "status"> | null | undefined, allowed: readonly Role[]): boolean {
  if (!profile || profile.status !== "active") return false;
  return allowed.includes(profile.role);
}

/** Accept only same-site relative paths, to stop open redirects via ?next=. */
export function safeNextPath(next: string | null | undefined, fallback: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
