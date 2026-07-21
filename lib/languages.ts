// Language catalogue for V1. `name` is the canonical value stored as plain
// text on the projects table — extend this list as the operator adds
// capacity; no schema change needed. `key` addresses the localized
// name/blurb in messages/*.json (languages.catalog.<key>).
export type LanguageRegion = "global" | "europe" | "africa" | "asia" | "mena";

export type LanguageInfo = {
  key: string;
  name: string;
  /** Endonym — locale-independent, shown under the localized name. */
  nativeName: string;
  /** ISO 3166-1 alpha-2 codes for flagcdn.com; first is primary. */
  flags: string[];
  region: LanguageRegion;
};

export const LANGUAGE_CATALOG: LanguageInfo[] = [
  { key: "english", name: "English", nativeName: "English", flags: ["gb", "us"], region: "global" },
  { key: "french", name: "French", nativeName: "Français", flags: ["fr"], region: "europe" },
  { key: "spanish", name: "Spanish", nativeName: "Español", flags: ["es"], region: "europe" },
  { key: "german", name: "German", nativeName: "Deutsch", flags: ["de"], region: "europe" },
  { key: "italian", name: "Italian", nativeName: "Italiano", flags: ["it"], region: "europe" },
  { key: "portuguese", name: "Portuguese", nativeName: "Português", flags: ["pt", "br"], region: "europe" },
  { key: "dutch", name: "Dutch", nativeName: "Nederlands", flags: ["nl"], region: "europe" },
  { key: "arabic", name: "Arabic", nativeName: "العربية", flags: ["sa"], region: "mena" },
  { key: "chinese", name: "Chinese (Simplified)", nativeName: "简体中文", flags: ["cn"], region: "asia" },
  { key: "japanese", name: "Japanese", nativeName: "日本語", flags: ["jp"], region: "asia" },
  { key: "korean", name: "Korean", nativeName: "한국어", flags: ["kr"], region: "asia" },
  { key: "russian", name: "Russian", nativeName: "Русский", flags: ["ru"], region: "europe" },
  { key: "turkish", name: "Turkish", nativeName: "Türkçe", flags: ["tr"], region: "mena" },
  { key: "polish", name: "Polish", nativeName: "Polski", flags: ["pl"], region: "europe" },
  { key: "yoruba", name: "Yoruba", nativeName: "Yorùbá", flags: ["ng"], region: "africa" },
  { key: "igbo", name: "Igbo", nativeName: "Asụsụ Igbo", flags: ["ng"], region: "africa" },
  { key: "hausa", name: "Hausa", nativeName: "Harshen Hausa", flags: ["ng"], region: "africa" },
  { key: "swahili", name: "Swahili", nativeName: "Kiswahili", flags: ["ke", "tz"], region: "africa" },
];

/** Canonical names used by the quote form and stored on projects rows. */
export const LANGUAGES: string[] = LANGUAGE_CATALOG.map(
  (language) => language.name,
);

export const LANGUAGE_REGIONS: LanguageRegion[] = [
  "global",
  "europe",
  "africa",
  "asia",
  "mena",
];
