import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { defaultLocale } from "@/i18n/config";
import { safeNextPath } from "@/lib/auth/roles";

const RESET_COOKIE = "zurag_pw_reset"; // set by requestPasswordReset (lib/account/actions.ts)

/** Email links (sign-up confirmation, password reset) land here: swap the one-time code for a session cookie. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  // A pending password reset in this browser always goes to the new-password page.
  const resetPending = request.cookies.get(RESET_COOKIE)?.value === "1";
  const next = resetPending ? `/${defaultLocale}/reset-password` : safeNextPath(searchParams.get("next"), `/${defaultLocale}`);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/${defaultLocale}/login?error=link`);
}
