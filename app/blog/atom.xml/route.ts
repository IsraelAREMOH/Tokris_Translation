import { escapeXml, getFeedEntries, getFeedSiteUrl } from "@/lib/blog/feed";

export const revalidate = 300;

export async function GET() {
  const [entries, siteUrl] = [await getFeedEntries(), getFeedSiteUrl()];
  const updated = entries[0]?.updatedAt
    ? new Date(entries[0].updatedAt).toISOString()
    : new Date().toISOString();

  const items = entries
    .map(
      (entry) => `
  <entry>
    <title>${escapeXml(entry.title)}</title>
    <link href="${entry.url}" />
    <id>${entry.url}</id>
    <updated>${new Date(entry.updatedAt).toISOString()}</updated>
    <published>${new Date(entry.publishedAt).toISOString()}</published>
    <summary>${escapeXml(entry.summary)}</summary>
    <content type="html">${escapeXml(entry.contentHtml)}</content>
    ${entry.categories.map((category) => `<category term="${escapeXml(category)}" />`).join("\n    ")}
  </entry>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Tokris Global Services — Blog</title>
  <link href="${siteUrl}/blog/atom.xml" rel="self" />
  <link href="${siteUrl}/blog" />
  <id>${siteUrl}/blog</id>
  <updated>${updated}</updated>${items}
</feed>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
