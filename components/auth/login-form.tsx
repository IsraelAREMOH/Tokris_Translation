"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { TextField } from "@/components/ui/text-field";
import { login, type AuthFormState } from "@/lib/auth/actions";

const initialState: AuthFormState = {};

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {redirectTo ? (
        <input type="hidden" name="redirect" value={redirectTo} />
      ) : null}

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
        autoComplete="current-password"
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
        {pending ? t("login.pending") : t("login.submit")}
      </button>
    </form>
  );
}
