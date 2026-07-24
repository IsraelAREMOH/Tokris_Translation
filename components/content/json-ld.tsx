/** Renders one or more schema.org objects as a JSON-LD <script> tag. Content
 * is our own server-built data (never raw user HTML), so this is safe. */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify already escapes the handful of characters that could
      // otherwise break out of the script context (notably "<").
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
