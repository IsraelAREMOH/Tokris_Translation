"use client";

import { useActionState } from "react";

import { TextField } from "@/components/ui/text-field";
import {
  MAX_CONTENT_VALUE_LENGTH,
  SITE_CONTENT_FIELDS,
} from "@/lib/content/constants";
import {
  updateSiteContent,
  type SiteContentState,
} from "@/lib/content/actions";

const initialState: SiteContentState = {};

export function SiteContentForm({
  content,
}: {
  content: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(
    updateSiteContent,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {SITE_CONTENT_FIELDS.map((field) =>
        field.multiline ? (
          <div key={field.key} className="flex flex-col gap-1.5">
            <label
              htmlFor={field.key}
              className="text-sm font-medium text-foreground"
            >
              {field.label}
            </label>
            <textarea
              id={field.key}
              name={field.key}
              rows={3}
              maxLength={MAX_CONTENT_VALUE_LENGTH}
              defaultValue={content[field.key] ?? ""}
              className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            />
            <p className="text-xs text-muted-foreground">{field.hint}</p>
          </div>
        ) : (
          <div key={field.key} className="flex flex-col gap-1.5">
            <TextField
              label={field.label}
              id={field.key}
              name={field.key}
              type="text"
              maxLength={MAX_CONTENT_VALUE_LENGTH}
              defaultValue={content[field.key] ?? ""}
            />
            <p className="text-xs text-muted-foreground">{field.hint}</p>
          </div>
        ),
      )}

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}
      {state.success && !state.error ? (
        <p role="status" className="text-xs font-medium text-brand-700 dark:text-brand-300">
          Saved — public pages now show the updated details.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center self-start rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
