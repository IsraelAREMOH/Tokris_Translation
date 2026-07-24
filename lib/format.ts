// Shared date presentation for console views (fixed en-GB format so server
// and client render identically regardless of machine locale).
export function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" });

/** "3 hours ago" / "2 days ago" — falls back to "just now" under a minute. */
export function formatRelativeTime(value: string) {
  const diffSeconds = (Date.now() - new Date(value).getTime()) / 1000;
  if (diffSeconds < 60) return "just now";

  for (const [unit, secondsInUnit] of RELATIVE_UNITS) {
    if (diffSeconds >= secondsInUnit) {
      return relativeTimeFormatter.format(-Math.floor(diffSeconds / secondsInUnit), unit);
    }
  }
  return "just now";
}
