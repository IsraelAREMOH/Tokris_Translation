import { getContactDetails } from "@/lib/contact/details";

export type SendOperatorEmailResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; status?: number; detail?: string };

// Kept small: 2 attempts x 4s + one short backoff stays well under Vercel's
// default serverless function timeout (10s on Hobby), so a persistent
// failure still returns our own friendly error instead of the platform's.
const REQUEST_TIMEOUT_MS = 4000;
const RETRY_DELAYS_MS = [400];

// Statuses worth retrying: 429 (rate limited) and any 5xx (Resend-side
// transient failure). A 4xx other than 429 means the request itself is
// wrong (bad key, bad payload) — retrying won't fix that, so fail fast.
function isRetryableStatus(status: number) {
  return status === 429 || status >= 500;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postToResend(
  apiKey: string,
  from: string,
  inbox: string,
  payload: { subject: string; text: string; replyTo?: string },
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [inbox],
        ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
        subject: payload.subject,
        text: payload.text,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Sends a transactional notification to the operator's inbox via the Resend
 * API. Shared by the contact form and quote request flows so both stay in
 * sync on the same from/to/auth handling instead of duplicating it. Uses
 * fetch directly (no SDK dependency); treats the .env.example placeholder
 * RESEND_API_KEY as unconfigured. CONTACT_FROM_EMAIL is required — there is
 * deliberately no fallback to Resend's shared onboarding@resend.dev sandbox
 * sender, since that domain isn't verified for this project and mail sent
 * from it is far more likely to be filtered or rejected outright.
 *
 * Retries once (2 attempts total) on network errors, timeouts, 429s, and
 * 5xx responses — those are transient by nature (a hung connection, a
 * momentary Resend-side blip, a brushed rate limit) and a plain retry with a
 * short backoff resolves them without the visitor ever seeing a failure.
 * Every failed attempt logs the full status + response body so a persistent
 * failure is fully diagnosable from server logs instead of just "it broke".
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
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!from) {
    console.error("sendOperatorEmail: CONTACT_FROM_EMAIL is not configured.");
    return { ok: false, error: "not_configured" };
  }

  const { email: inbox } = await getContactDetails();

  const attempts = RETRY_DELAYS_MS.length + 1;
  let lastError: SendOperatorEmailResult = { ok: false, error: "unknown" };

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let response: Response;
    try {
      response = await postToResend(apiKey, from, inbox, { subject, text, replyTo });
    } catch (fetchError) {
      const isTimeout = fetchError instanceof Error && fetchError.name === "AbortError";
      console.error(
        `sendOperatorEmail: attempt ${attempt}/${attempts} threw`,
        isTimeout ? "(timed out)" : "",
        fetchError,
      );
      lastError = { ok: false, error: isTimeout ? "timeout" : "network_error" };
      if (attempt < attempts) {
        await sleep(RETRY_DELAYS_MS[attempt - 1]);
        continue;
      }
      return lastError;
    }

    if (response.ok) {
      const body = await response.json().catch(() => null);
      return { ok: true, id: body?.id };
    }

    const detail = await response.text().catch(() => "");
    console.error(
      `sendOperatorEmail: attempt ${attempt}/${attempts} failed`,
      response.status,
      detail,
    );
    lastError = { ok: false, error: "resend_error", status: response.status, detail };

    if (attempt < attempts && isRetryableStatus(response.status)) {
      await sleep(RETRY_DELAYS_MS[attempt - 1]);
      continue;
    }
    return lastError;
  }

  return lastError;
}
