"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";

import { TextField } from "@/components/ui/text-field";
import { sendContactMessage } from "@/lib/contact/actions";
import {
  HONEYPOT_FIELD,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PHONE_LENGTH,
} from "@/lib/contact/constants";
import { MAX_MESSAGE_LENGTH } from "@/lib/validation";

export function ContactForm() {
  const t = useTranslations("contact.form");
  const [state, formAction, pending] = useActionState(sendContactMessage, {});
  const [startedAt] = useState(() => Date.now());

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input
        type="hidden"
        name="startedAt"
        value={startedAt}
        suppressHydrationWarning
      />
      {/* Honeypot: hidden from real users, tempting to bots. Positioned
          off-screen (not just visually clipped like `sr-only`) — that's the
          hiding technique browser/password-manager autofill heuristics
          actually check for and skip, whereas clip-based hiding is often
          still filled since it's indistinguishable from legitimate
          accessible-but-visually-hidden content. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="contact-hp">{t("honeypot")}</label>
        <input
          id="contact-hp"
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="contact-name"
          name="name"
          label={t("name")}
          autoComplete="name"
          maxLength={MAX_NAME_LENGTH}
          required
        />
        <TextField
          id="contact-email"
          name="email"
          type="email"
          label={t("email")}
          autoComplete="email"
          maxLength={MAX_EMAIL_LENGTH}
          required
        />
      </div>
      <TextField
        id="contact-phone"
        name="phone"
        type="tel"
        label={t("phone")}
        autoComplete="tel"
        maxLength={MAX_PHONE_LENGTH}
      />
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="contact-message"
          className="text-sm font-medium text-foreground"
        >
          {t("message")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder={t("messagePlaceholder")}
          className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p
          role="status"
          className="rounded-lg border border-brand-600/30 bg-brand-50 px-3.5 py-2.5 text-sm text-brand-800 dark:bg-brand-950 dark:text-brand-200"
        >
          {t("success")}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center self-start rounded-full bg-brand-600 px-7 py-3 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? t("pending") : t("submit")}
      </button>
    </form>
  );
}
