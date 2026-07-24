"use server";

import { getLocale, getTranslations } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSafeInternalPath } from "@/lib/validation";

export type AuthFormState = {
  error?: string;
  success?: string;
};

/** Only allow internal redirect targets (blocks open-redirect abuse). */
function safeRedirectPath(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  return isSafeInternalPath(value) ? value : null;
}

export async function login(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const t = await getTranslations("auth.errors");
  const locale = await getLocale();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: t("missingFields") };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    if (error?.code === "email_not_confirmed") {
      return { error: t("emailNotConfirmed") };
    }
    return { error: t("invalidCredentials") };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const fallback = profile?.role === "admin" ? "/admin" : "/portal";
  const target = safeRedirectPath(formData.get("redirect")) ?? fallback;

  redirect({ href: target, locale });
  return {}; // unreachable — redirect throws
}

export async function register(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const t = await getTranslations("auth.errors");
  const tRegister = await getTranslations("auth.register");
  const locale = await getLocale();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    return { error: t("missingFields") };
  }
  if (password.length < 8) {
    return { error: t("passwordTooShort") };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Read by the handle_new_user trigger to seed the profiles row
      data: {
        full_name: fullName,
        phone_number: phone || null,
      },
    },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { error: t("emailInUse") };
    }
    if (error.code === "weak_password") {
      return { error: t("passwordTooShort") };
    }
    return { error: t("generic") };
  }

  // Email confirmation enabled: no session yet, ask the user to check inbox.
  if (!data.session) {
    return { success: tRegister("checkEmail") };
  }

  redirect({ href: "/portal", locale });
  return {}; // unreachable — redirect throws
}

export async function signOut() {
  const locale = await getLocale();
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect({ href: "/login", locale });
}
