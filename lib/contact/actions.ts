"use server";

import { getTranslations } from "next-intl/server";

import {
  HONEYPOT_FIELD,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PHONE_LENGTH,
  MIN_SUBMIT_MS,
} from "@/lib/contact/constants";
import { sendOperatorEmail } from "@/lib/email/send";
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
 * Sends a public contact enquiry to the operator's inbox via Resend
 * (lib/email/send.ts).
 */
export async function sendContactMessage(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const t = await getTranslations("contact.form");

  // Bot filters run first. The honeypot reports fake success so scripts don't
  // learn they were filtered; the timing check returns its own distinct
  // "tooFast" error (not the send-failure message below) so a fast human
  // (e.g. browser autofill, or resubmitting right after a first try) isn't
  // told the contact channel is broken — they just need to wait a moment.
  if (String(formData.get(HONEYPOT_FIELD) ?? "") !== "") {
    return { success: true };
  }
  const startedAt = Number(formData.get("startedAt"));
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < MIN_SUBMIT_MS) {
    return { error: t("errors.tooFast") };
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

  const result = await sendOperatorEmail({
    subject: `New website enquiry from ${name}`,
    text: [`Name: ${name}`, `Email: ${email}`, `Phone: ${phone || "—"}`, "", message].join("\n"),
    replyTo: email,
  });

  if (!result.ok) {
    return { error: t("errors.sendFailed") };
  }

  return { success: true };
}
