/**
 * Shared by categories, tags and posts — anywhere an admin-entered name
 * needs a URL slug. NFKD normalization decomposes accented letters into a
 * base letter + combining mark (e.g. "é" -> "e" + U+0301); the a-z0-9 filter
 * below then drops the combining marks along with everything else non-slug.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
