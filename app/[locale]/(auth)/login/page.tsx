import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LoginForm } from "@/components/auth/login-form";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = { title: "Log In" };

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { redirect: redirectTo, error } = await searchParams;
  const t = await getTranslations("auth.login");

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-foreground">
        {t("title")}
      </h1>
      <p className="text-sm text-muted-foreground">{t("description")}</p>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
        >
          {t("confirmError")}
        </p>
      ) : null}

      <div className="mt-3">
        <LoginForm redirectTo={redirectTo} />
      </div>

      <p className="mt-3 text-sm">
        <Link
          href="/register"
          className="rounded-sm font-medium text-brand-600 transition-transform duration-200 ease-spring hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.98] dark:text-brand-400 dark:hover:text-brand-300"
        >
          {t("switchCta")}
        </Link>
      </p>
    </div>
  );
}
