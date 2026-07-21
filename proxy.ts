import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

/** Splits "/en/portal/x" into the locale and the logical path "/portal/x". */
function splitLocale(pathname: string): { locale: string; path: string } {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return { locale, path: "/" };
    if (pathname.startsWith(`/${locale}/`)) {
      return { locale, path: pathname.slice(locale.length + 1) };
    }
  }
  return { locale: routing.defaultLocale, path: pathname };
}

/** Redirects while preserving any freshly refreshed session cookies. */
function redirectWithCookies(source: NextResponse, url: URL) {
  const redirected = NextResponse.redirect(url);
  for (const cookie of source.cookies.getAll()) {
    redirected.cookies.set(cookie);
  }
  return redirected;
}

export default async function proxy(request: NextRequest) {
  const response = handleI18nRouting(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refreshes an expired session and validates it against the auth server.
  // Always use getUser() here — never trust getSession() in the proxy.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { locale, path } = splitLocale(request.nextUrl.pathname);
  const isPortalArea = path === "/portal" || path.startsWith("/portal/");
  const isAdminArea = path === "/admin" || path.startsWith("/admin/");
  const isAuthPage = path === "/login" || path === "/register";

  // Unauthenticated users are locked out of both workspaces.
  if ((isPortalArea || isAdminArea) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.search = "";
    if (path !== "/portal") url.searchParams.set("redirect", path);
    return redirectWithCookies(response, url);
  }

  if (user && (isAdminArea || isAuthPage)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const isAdmin = profile?.role === "admin";

    // Clients cannot enter the admin console.
    if (isAdminArea && !isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/portal`;
      url.search = "";
      return redirectWithCookies(response, url);
    }

    // Logged-in visitors skip the auth pages (GET only, so form POSTs
    // targeting these routes are never intercepted mid-action).
    if (isAuthPage && request.method === "GET") {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}${isAdmin ? "/admin" : "/portal"}`;
      url.search = "";
      return redirectWithCookies(response, url);
    }
  }

  return response;
}

export const config = {
  // Skip Next.js internals, API routes and static assets
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
