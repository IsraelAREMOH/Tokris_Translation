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

  // A network/DNS/timeout failure throws rather than resolving with a
  // non-ok response, so this needs its own try/catch — otherwise it escapes
  // the Server Action uncaught and the visitor sees a generic crash page
  // instead of the friendly errors.sendFailed message below.
  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
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
  } catch (fetchError) {
    console.error("Contact form: Resend request threw:", fetchError);
    return { error: t("errors.sendFailed") };
  }

  const responseText = await response.text();

  if (!response.ok) {
    console.error("Contact form: Resend request failed:", response.status, responseText);
    return { error: t("errors.sendFailed") };
  }

  // TEMPORARY — diagnostic logging for the info@tokrisglobal.com delivery
  // investigation (2026-08-06). Remove once inbound routing is confirmed
  // fixed. A 2xx here only means Resend accepted the message for sending;
  // it says nothing about whether the recipient's mail server ultimately
  // stored it, so this is logged for cross-referencing against the Resend
  // dashboard's per-message event timeline, not treated as proof of inbox
  // delivery.
  let resendId: string | undefined;
  try {
    resendId = JSON.parse(responseText)?.id;
  } catch {
    // Unexpected non-JSON 2xx body — leave resendId undefined, still log the raw text below.
  }
  console.log("Contact form: Resend accepted enquiry for delivery", {
    to: inbox,
    resendMessageId: resendId,
    httpStatus: response.status,
    rawResponse: responseText,
  });

  return { success: true };
}
