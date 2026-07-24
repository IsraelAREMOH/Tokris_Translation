"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { Link } from "@/i18n/navigation";

/**
 * Catches uncaught exceptions in any Server/Client Component under
 * app/[locale]/ — public site, Client Portal, and Admin Console alike —
 * so a Supabase hiccup or unexpected exception shows this branded screen
 * instead of Next.js's generic default error page. Doesn't catch
 * notFound()/redirect() (Next.js routes those around error boundaries), so
 * this can't reintroduce the loading.tsx/notFound() streaming bug.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error("Unhandled error in app/[locale]:", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-7xl font-semibold tracking-[-0.03em] text-danger">!</p>
      <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground">
        {t("title")}
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">{t("description")}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
        >
          {t("retry")}
        </button>
        <Link
          href="/"
          className="rounded-full border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-foreground shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
        >
          {t("back")}
        </Link>
      </div>
    </div>
  );
}
