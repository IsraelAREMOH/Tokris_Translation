// The editable site-wide settings. Each key exists as a row in site_content
// (seeded by migration 0004); the form and the update action both iterate
// this list, so adding a field here is the only code change needed.
export type SiteContentField = {
  key: string;
  label: string;
  hint: string;
  multiline?: boolean;
};

export const SITE_CONTENT_FIELDS: SiteContentField[] = [
  {
    key: "whatsapp_number",
    label: "WhatsApp number",
    hint: "Digits only, with country code (e.g. 447700900123) — powers the floating chat button on every public page.",
  },
  {
    key: "contact_email",
    label: "Contact email",
    hint: "Shown on the public contact page.",
  },
  {
    key: "contact_phone",
    label: "Contact phone",
    hint: "Shown on the public contact page.",
  },
  {
    key: "office_address",
    label: "Office address",
    hint: "Shown on the public contact page.",
    multiline: true,
  },
];

export const MAX_CONTENT_VALUE_LENGTH = 500;

/** Digits only, 6–15 digits (E.164 without the +), or empty to hide/fallback. */
export const WHATSAPP_NUMBER_PATTERN = /^\d{6,15}$/;
