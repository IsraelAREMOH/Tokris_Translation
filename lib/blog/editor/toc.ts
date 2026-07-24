import { slugify } from "@/lib/blog/slugify";

export type TocEntry = { id: string; text: string; level: 2 | 3 };

const HEADING_PATTERN = /<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g;

/**
 * Pulls H2/H3 headings out of content_html and injects matching anchor ids
 * — a plain regex rather than a full HTML parser, which is safe here only
 * because we control the source (our own editor's output, not arbitrary
 * third-party HTML) and headings never contain nested block content.
 */
export function extractToc(html: string): { toc: TocEntry[]; html: string } {
  const toc: TocEntry[] = [];
  const usedIds = new Set<string>();

  const withIds = html.replace(HEADING_PATTERN, (match, level, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    if (!text) return match;

    const base = slugify(text) || "section";
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${base}-${suffix++}`;
    }
    usedIds.add(id);

    toc.push({ id, text, level: Number(level) as 2 | 3 });
    return `<h${level}${attrs ?? ""} id="${id}">${inner}</h${level}>`;
  });

  return { toc, html: withIds };
}
