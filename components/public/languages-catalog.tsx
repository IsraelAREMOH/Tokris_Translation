"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { FlagBadge } from "@/components/public/flag-badge";
import {
  LANGUAGE_CATALOG,
  LANGUAGE_REGIONS,
  type LanguageRegion,
} from "@/lib/languages";

const REGION_LABEL_KEY: Record<LanguageRegion, string> = {
  global: "regionGlobal",
  europe: "regionEurope",
  africa: "regionAfrica",
  asia: "regionAsia",
  mena: "regionMena",
};

/**
 * The exhaustive master catalogue with live search and region filters.
 * Localized names/blurbs come from the `languages` messages namespace
 * (available client-side via the layout's NextIntlClientProvider).
 */
export function LanguagesCatalog() {
  const t = useTranslations("languages");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<LanguageRegion | null>(null);

  const entries = useMemo(
    () =>
      LANGUAGE_CATALOG.map((language) => ({
        ...language,
        localizedName: t(`catalog.${language.key}.name`),
        blurb: t(`catalog.${language.key}.blurb`),
        regionLabel: t(REGION_LABEL_KEY[language.region]),
      })),
    [t],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = entries.filter((entry) => {
    if (region && entry.region !== region) return false;
    if (!normalizedQuery) return true;
    return [entry.localizedName, entry.name, entry.nativeName]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  const chipClass = (active: boolean) =>
    `inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] ${
      active
        ? "border-brand-600 bg-brand-600 text-white shadow-brand dark:border-brand-400 dark:bg-brand-400 dark:text-brand-950"
        : "border-border bg-surface text-muted-foreground shadow-elevated hover:text-foreground"
    }`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <label htmlFor="language-search" className="sr-only">
            {t("searchLabel")}
          </label>
          <input
            id="language-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-full border border-border bg-surface py-2.5 pr-4 pl-10 text-sm text-foreground shadow-elevated placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          />
        </div>
        <p aria-live="polite" className="text-xs font-medium text-muted-foreground">
          {t("count", { count: filtered.length })}
        </p>
      </div>

      <div
        role="group"
        aria-label={t("filterLabel")}
        className="flex flex-wrap gap-2"
      >
        <button
          type="button"
          onClick={() => setRegion(null)}
          aria-pressed={region === null}
          className={chipClass(region === null)}
        >
          {t("filterAll")}
        </button>
        {LANGUAGE_REGIONS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRegion(region === value ? null : value)}
            aria-pressed={region === value}
            className={chipClass(region === value)}
          >
            {t(REGION_LABEL_KEY[value])}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center shadow-elevated">
          <p className="text-sm text-muted-foreground">{t("noResults")}</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry) => (
            <li
              key={entry.key}
              className="group flex flex-col gap-3.5 rounded-2xl border border-border/60 bg-surface/40 p-5 shadow-elevated backdrop-blur-md transition-transform duration-300 ease-spring hover:-translate-y-1 hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between gap-3">
                <FlagBadge codes={entry.flags} size="lg" />
                <span className="rounded-full border border-brand-600/20 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] uppercase text-brand-700 dark:border-brand-400/20 dark:bg-brand-950 dark:text-brand-300">
                  {entry.regionLabel}
                </span>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold tracking-[-0.01em] text-foreground">
                  {entry.localizedName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {entry.nativeName}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">{entry.blurb}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
