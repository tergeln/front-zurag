import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, LOCALE_COOKIE } from "@/i18n/config";
import { isLocalPreview } from "@/lib/preview";
import { supabaseEnv } from "@/lib/supabase/env";

/**
 * Runs before every page request:
 * 1. Adds the locale prefix (/mn by default) when it is missing.
 * 2. Refreshes the Supabase session cookie.
 * Authorization is NOT done here. Pages and API routes check roles themselves (requireRole).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];

  // Supabase falls back to the bare Site URL (with ?code=...) when the redirect URL
  // isn't on its allow list. Send that code to the callback route.
  const code = request.nextUrl.searchParams.get("code");
  if (code && !pathname.startsWith("/auth/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    url.search = `?code=${encodeURIComponent(code)}&next=/${defaultLocale}/account`;
    return NextResponse.redirect(url);
  }

  if (!isLocale(first) && !pathname.startsWith("/auth/")) {
    const preferred = request.cookies.get(LOCALE_COOKIE)?.value;
    const locale = isLocale(preferred) ? preferred : defaultLocale;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });
  if (isLocalPreview()) return response;
  const { url, key } = supabaseEnv();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  // Validates the token with Supabase and refreshes it if expired.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Skip API routes, Next internals and files with an extension (images, favicon, ...).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
