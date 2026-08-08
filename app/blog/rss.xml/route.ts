import { escapeXml, getFeedEntries, getFeedSiteUrl } from "@/lib/blog/feed";

export const revalidate = 300;

/** CDATA can't literally contain "]]>" — split any occurrence so it stays valid. */
function cdata(value: string) {
  return `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

export async function GET() {
  const [entries, siteUrl] = [await getFeedEntries(), getFeedSiteUrl()];

  const items = entries
    .map(
      (entry) => `
    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${entry.url}</link>
      <guid isPermaLink="true">${entry.url}</guid>
      <pubDate>${new Date(entry.publishedAt).toUTCString()}</pubDate>
      <description>${cdata(entry.summary)}</description>
      <content:encoded>${cdata(entry.contentHtml)}</content:encoded>
      ${entry.categories.map((category) => `<category>${escapeXml(category)}</category>`).join("\n      ")}
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Tokris Global Services — Blog</title>
    <link>${siteUrl}/blog</link>
    <atom:link href="${siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <description>Practical guidance on certified translation, interpretation, localization and going global.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
