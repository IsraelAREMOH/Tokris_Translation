"use client";

import { Mail } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { BulkActionBar } from "@/components/admin/bulk-action-bar";
import { EmptyState } from "@/components/admin/empty-state";
import { NewsletterTable } from "@/components/admin/blog/newsletter-table";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { bulkDeleteSubscribers } from "@/lib/blog/newsletter/actions";
import type { NewsletterSubscriber } from "@/lib/blog/newsletter/queries";

export function NewsletterManager({
  subscribers,
  hasFilters,
}: {
  subscribers: NewsletterSubscriber[];
  hasFilters: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const confirm = useConfirm();
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulkDelete() {
    startTransition(async () => {
      const ok = await confirm({
        title: `Remove ${selected.size} subscriber${selected.size === 1 ? "" : "s"}?`,
        description: "This can't be undone.",
        confirmLabel: "Remove",
        danger: true,
      });
      if (!ok) return;

      const result = await bulkDeleteSubscribers(Array.from(selected));
      if (result.error) toast.error(result.error);
      else {
        toast.success("Subscribers removed.");
        setSelected(new Set());
      }
    });
  }

  if (subscribers.length === 0) {
    return (
      <EmptyState
        icon={Mail}
        title={hasFilters ? "No subscribers match your filters." : "No subscribers yet"}
        description={
          hasFilters
            ? "Try a different search or status."
            : "Signups from the blog's newsletter widget land here — nothing to show until your first visitor subscribes."
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <NewsletterTable subscribers={subscribers} selected={selected} onToggle={toggle} />

      <BulkActionBar
        selectedCount={selected.size}
        onClear={() => setSelected(new Set())}
        actions={[{ label: "Remove", onClick: bulkDelete, danger: true, pending }]}
      />
    </div>
  );
}
