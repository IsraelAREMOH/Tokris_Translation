"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { TextField } from "@/components/ui/text-field";
import { register, type AuthFormState } from "@/lib/auth/actions";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState(register, initialState);

  if (state.success) {
    return (
      <div
        role="status"
        className="rounded-xl border border-brand-600/25 bg-brand-50 px-5 py-6 text-sm text-brand-800 dark:border-brand-400/25 dark:bg-brand-950 dark:text-brand-200"
      >
        {state.success}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <TextField
        label={t("fields.fullName")}
        id="fullName"
        name="fullName"
        type="text"
        autoComplete="name"
        required
      />
      <TextField
        label={t("fields.phone")}
        id="phone"
        name="phone"
        type="tel"
        autoComplete="tel"
      />
      <TextField
        label={t("fields.email")}
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <TextField
        label={t("fields.password")}
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
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
        className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? t("register.pending") : t("register.submit")}
      </button>
    </form>
  );
}
