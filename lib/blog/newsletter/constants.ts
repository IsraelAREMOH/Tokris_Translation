export type NewsletterStatus = "subscribed" | "unsubscribed";

export const NEWSLETTER_STATUSES: NewsletterStatus[] = ["subscribed", "unsubscribed"];

export function isNewsletterStatus(value: string): value is NewsletterStatus {
  return (NEWSLETTER_STATUSES as string[]).includes(value);
}

export const NEWSLETTER_PAGE_SIZE = 20;

/**
 * Known signup surfaces — the DB column itself is plain `text` (no CHECK
 * constraint) so new sources can be added here without a migration, but the
 * subscribe action still validates against this list rather than storing
 * whatever a caller sends: `source` reaches the admin's newsletter export as
 * a raw CSV cell, so accepting arbitrary text would be a stored-injection
 * surface (see subscribeToNewsletter()).
 */
export const KNOWN_NEWSLETTER_SOURCES = ["blog", "blog-landing", "article"] as const;

export function normalizeNewsletterSource(value: string): string {
  return (KNOWN_NEWSLETTER_SOURCES as readonly string[]).includes(value) ? value : "blog";
}
