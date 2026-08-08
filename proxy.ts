import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

/** Redirects while preserving any freshly refreshed session cookies. */
function redirectWithCookies(source: NextResponse, url: URL) {
  const redirected = NextResponse.redirect(url);
  for (const cookie of source.cookies.getAll()) {
    redirected.cookies.set(cookie);
  }
  return redirected;
}

export default async function proxy(request: NextRequest) {
  // Permanently redirect old locale-prefixed URLs (from before localePrefix
  // was set to "never" in i18n/routing.ts, and still indexed by search
  // engines) to their unprefixed equivalent — /en/about -> /about.
  const { pathname } = request.nextUrl;
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/en" ? "/" : pathname.slice("/en".length);
    return NextResponse.redirect(url, 308);
  }

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

  const path = pathname;
  const isPortalArea = path === "/portal" || path.startsWith("/portal/");
  const isAdminArea = path === "/admin" || path.startsWith("/admin/");
  const isAuthPage = path === "/login" || path === "/register";

  // Unauthenticated users are locked out of both workspaces.
  if ((isPortalArea || isAdminArea) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
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
      url.pathname = "/portal";
      url.search = "";
      return redirectWithCookies(response, url);
    }

    // Logged-in visitors skip the auth pages (GET only, so form POSTs
    // targeting these routes are never intercepted mid-action).
    if (isAuthPage && request.method === "GET") {
      const url = request.nextUrl.clone();
      url.pathname = isAdmin ? "/admin" : "/portal";
      url.search = "";
      return redirectWithCookies(response, url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals, API routes and static assets (files with a
    // dot) — with two exceptions listed below: old locale-prefixed feed
    // URLs also have a dot (rss.xml/atom.xml) and still need to hit this
    // middleware so the /en redirect above can catch them. The unprefixed
    // feed routes (app/blog/rss.xml, app/blog/atom.xml) live outside
    // app/[locale] entirely, so they resolve as plain static routes and
    // don't need the middleware to run at all.
    "/((?!api|_next|_vercel|.*\\..*).*)",
    "/en/blog/rss.xml",
    "/en/blog/atom.xml",
  ],
};
