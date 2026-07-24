"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import type { SimpleActionState } from "@/components/admin/action-button";
import { useConfirm } from "@/components/ui/confirm-dialog";

/** Destructive action, gated by useConfirm() before the server action runs. */
export function DeleteButton({
  action,
  fields,
  confirmTitle,
  confirmDescription,
  label = "Delete",
  successMessage = "Deleted.",
  variant = "icon",
}: {
  action: (prev: SimpleActionState, formData: FormData) => Promise<SimpleActionState>;
  fields: Record<string, string>;
  confirmTitle: string;
  confirmDescription?: string;
  label?: string;
  successMessage?: string;
  variant?: "icon" | "menu-item";
}) {
  const confirm = useConfirm();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const ok = await confirm({
        title: confirmTitle,
        description: confirmDescription,
        confirmLabel: "Delete",
        danger: true,
      });
      if (!ok) return;

      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => formData.set(key, value));

      const result = await action({}, formData);
      if (result.error) toast.error(result.error);
      else toast.success(successMessage);
    });
  }

  if (variant === "menu-item") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-danger transition-transform duration-200 ease-spring hover:bg-danger/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-transform duration-200 ease-spring hover:bg-danger/10 hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-90 disabled:pointer-events-none disabled:opacity-60"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
