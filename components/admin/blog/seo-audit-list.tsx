import { Link } from "@/i18n/navigation";
import type { SeoAuditPost } from "@/lib/cms/seo/audit";

export function SeoAuditList({
  title,
  posts,
  okMessage,
}: {
  title: string;
  posts: SeoAuditPost[];
  okMessage: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span
          className={`text-xs font-semibold whitespace-nowrap ${
            posts.length === 0 ? "text-brand-600 dark:text-brand-400" : "text-danger"
          }`}
        >
          {posts.length === 0 ? "All good" : `${posts.length} to fix`}
        </span>
      </div>
      {posts.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">{okMessage}</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-0.5">
          {posts.slice(0, 8).map((post) => (
            <li key={post.id}>
              <Link
                href={`/admin/blog/posts/${post.id}`}
                className="block truncate rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              >
                {post.title}
              </Link>
            </li>
          ))}
          {posts.length > 8 ? (
            <li className="px-2 py-1 text-xs text-muted-foreground">+{posts.length - 8} more</li>
          ) : null}
        </ul>
      )}
    </div>
  );
}

export function SeoDuplicateList({
  title,
  groups,
  okMessage,
}: {
  title: string;
  groups: { label: string; posts: SeoAuditPost[] }[];
  okMessage: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span
          className={`text-xs font-semibold whitespace-nowrap ${
            groups.length === 0 ? "text-brand-600 dark:text-brand-400" : "text-danger"
          }`}
        >
          {groups.length === 0 ? "All good" : `${groups.length} duplicate${groups.length === 1 ? "" : "s"}`}
        </span>
      </div>
      {groups.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">{okMessage}</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-3">
          {groups.slice(0, 6).map((group) => (
            <li key={group.label}>
              <p className="truncate text-xs font-medium text-foreground">“{group.label}”</p>
              <ul className="mt-1 flex flex-col gap-0.5 pl-3">
                {group.posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/admin/blog/posts/${post.id}`}
                      className="block truncate rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
