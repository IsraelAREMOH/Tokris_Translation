"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";

import { FileDropZone } from "@/components/quote/file-drop-zone";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { Link } from "@/i18n/navigation";
import { LANGUAGES } from "@/lib/languages";
import { submitQuoteRequest, type QuoteFormState } from "@/lib/quotes/actions";
import { MAX_INSTRUCTIONS_LENGTH } from "@/lib/validation";

const initialState: QuoteFormState = {};

export function QuoteForm() {
  const t = useTranslations("quote.form");
  const [state, formAction, pending] = useActionState(
    submitQuoteRequest,
    initialState,
  );
  const [minDate] = useState(() => new Date().toISOString().slice(0, 10));

  if (state.success) {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-5 rounded-2xl border border-brand-600/25 bg-brand-50 px-6 py-8 dark:border-brand-400/25 dark:bg-brand-950"
      >
        <p className="text-sm text-brand-800 dark:text-brand-200">
          {t("success")}
        </p>
        <Link
          href="/portal/requests"
          className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
        >
          {t("successCta")}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label={t("sourceLanguage")}
          id="sourceLanguage"
          name="sourceLanguage"
          defaultValue=""
          required
        >
          <option value="" disabled>
            {t("selectPlaceholder")}
          </option>
          {LANGUAGES.map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </SelectField>

        <SelectField
          label={t("targetLanguage")}
          id="targetLanguage"
          name="targetLanguage"
          defaultValue=""
          required
        >
          <option value="" disabled>
            {t("selectPlaceholder")}
          </option>
          {LANGUAGES.map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </SelectField>
      </div>

      <TextField
        label={t("deadline")}
        id="deadline"
        name="deadline"
        type="date"
        min={minDate}
        required
        suppressHydrationWarning
      />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="instructions"
          className="text-sm font-medium text-foreground"
        >
          {t("instructions")}
        </label>
        <textarea
          id="instructions"
          name="instructions"
          rows={5}
          maxLength={MAX_INSTRUCTIONS_LENGTH}
          placeholder={t("instructionsPlaceholder")}
          className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        />
      </div>

      <FileDropZone />

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
        className="inline-flex items-center justify-center rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 sm:self-start"
      >
        {pending ? t("pending") : t("submit")}
      </button>
    </form>
  );
}
