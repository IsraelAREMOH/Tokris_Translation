import { getTranslations } from "next-intl/server";

import { FlagBadge } from "@/components/public/flag-badge";
import { LANGUAGE_CATALOG } from "@/lib/languages";

/**
 * "Supported Languages Display Terminal" — the compact glassmorphism flag
 * grid shared by the Home and Services pages. The Languages page renders the
 * expanded, searchable catalogue instead.
 */
export async function LanguageTerminal() {
  const t = await getTranslations("languages.catalog");

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {LANGUAGE_CATALOG.map((language) => (
        <li
          key={language.key}
          className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/40 px-3.5 py-3 shadow-elevated backdrop-blur-md transition-transform duration-300 ease-spring hover:-translate-y-1 hover:scale-[1.02]"
        >
          <FlagBadge codes={language.flags} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-foreground">
              {t(`${language.key}.name`)}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {language.nativeName}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
