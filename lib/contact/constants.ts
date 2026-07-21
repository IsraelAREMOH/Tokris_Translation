// Contact form constraints shared by the form (client) and the server action.
export const MAX_NAME_LENGTH = 100;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_PHONE_LENGTH = 30;

/**
 * Bot filters. The honeypot is a visually hidden field that automated
 * submitters tend to fill; MIN_SUBMIT_MS rejects submits faster than a human
 * can plausibly complete the form. Both are deterrents, not guarantees —
 * add provider-level rate limiting if abuse appears.
 */
export const HONEYPOT_FIELD = "company";
export const MIN_SUBMIT_MS = 3000;
