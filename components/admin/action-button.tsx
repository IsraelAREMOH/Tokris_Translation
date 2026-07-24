"use client";

import { useActionState, useEffect, type ReactNode } from "react";
import { toast } from "sonner";

export type SimpleActionState = { error?: string; success?: boolean };

/**
 * Fire-and-forget server action wrapped in a real <form> (hidden fields +
 * submit button) — no client-side state to manage, just a toast if it fails.
 * Use for non-destructive one-click actions (reorder, publish, etc.); for
 * anything destructive, gate it behind useConfirm() first (see DeleteButton).
 */
export function ActionButton({
  action,
  fields,
  className,
  ariaLabel,
  disabled,
  children,
}: {
  action: (prev: SimpleActionState, formData: FormData) => Promise<SimpleActionState>;
  fields: Record<string, string>;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  const [state, formAction, pending] = useActionState<SimpleActionState, FormData>(
    action,
    {},
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <form action={formAction}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button
        type="submit"
        disabled={pending || disabled}
        aria-label={ariaLabel}
        className={className}
      >
        {children}
      </button>
    </form>
  );
}
