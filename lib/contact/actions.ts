"use server";

import { getTranslations } from "next-intl/server";

import {
  HONEYPOT_FIELD,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PHONE_LENGTH,
  MIN_SUBMIT_MS,
} from "@/lib/contact/constants";
import { getContactDetails } from "@/lib/contact/details";
import { MAX_MESSAGE_LENGTH } from "@/lib/validation";

export type ContactFormState = {
  error?: string;
  success?: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Collapses whitespace and strips control characters so user-supplied text is
 * safe to interpolate into an email subject line.
 */
function toSingleLine(value: FormDataEntryValue | null, maxLength: number) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/**
 * Sends a public contact enquiry to the operator's inbox via the Resend API.
 * Uses fetch directly so no SDK dependency is needed; requires RESEND_API_KEY
 * (the .env.example placeholder value is treated as unconfigured).
 */
export async function sendContactMessage(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const t = await getTranslations("contact.form");

  // Bot filters run first. The honeypot reports fake success so scripts don't
  // learn they were filtered; the timing check returns a retryable error so a
  // fast human (e.g. browser autofill) just submits again and passes.
  if (String(formData.get(HONEYPOT_FIELD) ?? "") !== "") {
    return { success: true };
  }
  const startedAt = Number(formData.get("startedAt"));
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < MIN_SUBMIT_MS) {
    return { error: t("errors.sendFailed") };
  }

  const name = toSingleLine(formData.get("name"), MAX_NAME_LENGTH);
  const email = toSingleLine(formData.get("email"), MAX_EMAIL_LENGTH);
  const phone = toSingleLine(formData.get("phone"), MAX_PHONE_LENGTH);
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { error: t("errors.missingFields") };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { error: t("errors.invalidEmail") };
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { error: t("errors.messageTooLong", { max: MAX_MESSAGE_LENGTH }) };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("your_")) {
    console.error("Contact form: RESEND_API_KEY is not configured.");
    return { error: t("errors.sendFailed") };
  }

  const { email: inbox } = await getContactDetails();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || "TGS Website <onboarding@resend.dev>",
      to: [inbox],
      reply_to: email,
      subject: `New website enquiry from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "—"}`,
        "",
        message,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    console.error(
      "Contact form: Resend request failed:",
      response.status,
      await response.text(),
    );
    return { error: t("errors.sendFailed") };
  }

  return { success: true };
}
