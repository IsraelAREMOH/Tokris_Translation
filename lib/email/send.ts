import { getContactDetails } from "@/lib/contact/details";

export type SendOperatorEmailResult = { ok: true } | { ok: false; error: string };

/**
 * Sends a transactional notification to the operator's inbox via the Resend
 * API. Shared by the contact form and quote request flows so both stay in
 * sync on the same from/to/auth handling instead of duplicating it. Uses
 * fetch directly (no SDK dependency); treats the .env.example placeholder
 * RESEND_API_KEY as unconfigured.
 */
export async function sendOperatorEmail({
  subject,
  text,
  replyTo,
}: {
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<SendOperatorEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("your_")) {
    console.error("sendOperatorEmail: RESEND_API_KEY is not configured.");
    return { ok: false, error: "not_configured" };
  }

  const { email: inbox } = await getContactDetails();

  // A network/DNS/timeout failure throws rather than resolving with a
  // non-ok response, so this needs its own try/catch.
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
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject,
        text,
      }),
    });
  } catch (fetchError) {
    console.error("sendOperatorEmail: Resend request threw:", fetchError);
    return { ok: false, error: "network_error" };
  }

  if (!response.ok) {
    console.error("sendOperatorEmail: Resend request failed:", response.status, await response.text());
    return { ok: false, error: "resend_error" };
  }

  return { ok: true };
}
