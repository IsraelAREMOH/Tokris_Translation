"use client";

import { useActionState } from "react";

import { MAX_MESSAGE_LENGTH } from "@/lib/validation";

export type MessageFormState = {
  error?: string;
  success?: boolean;
};

/**
 * Timeline message input shared by the admin console and the client portal —
 * the caller supplies the Server Action and copy. The field clears itself
 * after a successful action (React 19 resets uncontrolled forms).
 */
export function MessageForm({
  projectId,
  action,
  label,
  placeholder,
  submitLabel,
}: {
  projectId: string;
  action: (
    state: MessageFormState,
    formData: FormData,
  ) => Promise<MessageFormState>;
  label: string;
  placeholder: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="projectId" value={projectId} />

      <label htmlFor="message" className="text-sm font-medium text-foreground">
        {label}
      </label>
      <textarea
        id="message"
        name="message"
        rows={3}
        required
        maxLength={MAX_MESSAGE_LENGTH}
        placeholder={placeholder}
        className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      />

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center self-start rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}
