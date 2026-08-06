"use client";

import { useActionState } from "react";

import { SocialLinks } from "@/components/social/social-links";
import { subscribeToNewsletter, type NewsletterActionState } from "@/lib/blog/newsletter/actions";

const initialState: NewsletterActionState = {};

/** Used on the blog landing page and every article page — `source` tags where
 * the subscription came from without needing separate components per page. */
export function NewsletterSignup({
  source,
  title,
  description,
  emailLabel,
  placeholder,
  submitLabel,
  successMessage,
  followLabel,
  className = "",
}: {
  source: string;
  title: string;
  description: string;
  emailLabel: string;
  placeholder: string;
  submitLabel: string;
  successMessage: string;
  followLabel: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialState);
  const fieldId = `newsletter-email-${source}`;

  return (
    <div
      className={`relative isolate overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-elevated sm:p-8 ${className}`}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-brand-400 to-accent-400"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-16 -right-10 h-48 w-48 rounded-full bg-[radial-gradient(closest-side,rgb(56_152_139/0.16),transparent_70%)] blur-2xl" />
        <div className="bg-noise absolute inset-0 opacity-[0.035]" />
      </div>
      <h2 className="font-display text-xl font-semibold tracking-[-0.01em] text-foreground">
        {title}
      </h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>

      {state.success ? (
        <p role="status" className="mt-4 text-sm font-medium text-brand-700 dark:text-brand-300">
          {successMessage}
        </p>
      ) : (
        <form action={formAction} className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <input type="hidden" name="source" value={source} />
          <label htmlFor={fieldId} className="sr-only">
            {emailLabel}
          </label>
          <input
            id={fieldId}
            type="email"
            name="email"
            required
            placeholder={placeholder}
            className="w-full flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
          >
            {submitLabel}
          </button>
        </form>
      )}

      {state.error ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <div className="mt-5 flex items-center gap-3 border-t border-border/60 pt-5">
        <p className="text-xs font-medium text-muted-foreground">{followLabel}</p>
        <SocialLinks label={followLabel} variant="subtle" />
      </div>
    </div>
  );
}
