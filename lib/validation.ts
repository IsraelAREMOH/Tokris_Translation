// Input constraints shared by client-portal and admin server actions.
export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const MAX_MESSAGE_LENGTH = 2000;

export const MAX_INSTRUCTIONS_LENGTH = 2000;

/**
 * Guards a user-supplied "redirect to" path against open-redirect abuse.
 * A naive `value.startsWith("/") && !value.startsWith("//")` check (the
 * pattern this replaced in both lib/auth/actions.ts and
 * app/api/auth/confirm/route.ts) is NOT sufficient: `/\evil.com` starts
 * with a single `/`, but the WHATWG URL parser normalizes a backslash to a
 * forward slash during authority parsing, so `new URL("/\\evil.com", base)`
 * resolves to `https://evil.com` — verified directly against Node's URL
 * parser. Rejecting any backslash closes that exact bypass; the leading-`/`
 * and no-double-slash checks remain to reject absolute/protocol-relative
 * URLs outright.
 */
export function isSafeInternalPath(value: string): boolean {
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("\\");
}
