"use client";

import { NewsletterStatusBadge } from "@/components/admin/blog/newsletter-status-badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteSubscriber } from "@/lib/blog/newsletter/actions";
import type { NewsletterSubscriber } from "@/lib/blog/newsletter/queries";
import { formatDate } from "@/lib/format";

const SOURCE_LABELS: Record<string, string> = {
  blog: "Blog",
  homepage: "Homepage",
  contact: "Contact",
};

export function NewsletterTable({
  subscribers,
  selected,
  onToggle,
}: {
  subscribers: NewsletterSubscriber[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-elevated">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            <th className="w-10 px-4 py-3.5" />
            {["Email", "Status", "Source", "Subscribed", ""].map((heading) => (
              <th
                key={heading}
                scope="col"
                className="px-4 py-3.5 text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {subscribers.map((subscriber) => (
            <tr
              key={subscriber.id}
              className="border-b border-border last:border-b-0 hover:bg-background"
            >
              <td className="px-4 py-4">
                <input
                  type="checkbox"
                  checked={selected.has(subscriber.id)}
                  onChange={() => onToggle(subscriber.id)}
                  aria-label={`Select ${subscriber.email}`}
                  className="h-4 w-4 rounded border-border text-brand-600"
                />
              </td>
              <td className="px-4 py-4 text-sm font-semibold text-foreground">
                {subscriber.email}
              </td>
              <td className="px-4 py-4">
                <NewsletterStatusBadge status={subscriber.status} />
              </td>
              <td className="px-4 py-4 text-sm whitespace-nowrap text-muted-foreground">
                {SOURCE_LABELS[subscriber.source] ?? subscriber.source}
              </td>
              <td className="px-4 py-4 text-sm whitespace-nowrap text-muted-foreground">
                {formatDate(subscriber.subscribed_at)}
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-end gap-1">
                  <DeleteButton
                    action={deleteSubscriber}
                    fields={{ id: subscriber.id }}
                    confirmTitle={`Remove ${subscriber.email}?`}
                    confirmDescription="This can't be undone."
                    label={`Remove ${subscriber.email}`}
                    successMessage="Subscriber removed."
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
