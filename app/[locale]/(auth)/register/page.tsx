import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { RegisterForm } from "@/components/auth/register-form";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = { title: "Create Account" };

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.register");

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-foreground">
        {t("title")}
      </h1>
      <p className="text-sm text-muted-foreground">{t("description")}</p>

      <div className="mt-3">
        <RegisterForm />
      </div>

      <p className="mt-3 text-sm">
        <Link
          href="/login"
          className="rounded-sm font-medium text-brand-600 transition-transform duration-200 ease-spring hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.98] dark:text-brand-400 dark:hover:text-brand-300"
        >
          {t("switchCta")}
        </Link>
      </p>
    </div>
  );
}
