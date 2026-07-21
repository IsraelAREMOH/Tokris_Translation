import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-7xl font-semibold tracking-[-0.03em] text-brand-600 dark:text-brand-400">
        404
      </p>
      <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground">
        {t("title")}
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {t("description")}
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
      >
        {t("back")}
      </Link>
    </div>
  );
}
