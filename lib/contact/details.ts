import { getSiteContent } from "@/lib/content/site-content";

// Company contact details from the TGS brand document — used as fallbacks
// when the operator hasn't set values in Admin -> Site Content.
export const DEFAULT_CONTACT_PHONES = [
  "+234 912 188 4999",
  "+234 912 614 5745",
];
export const DEFAULT_CONTACT_EMAIL = "info@tokrisglobal.com";
export const DEFAULT_OFFICE_ADDRESS =
  "Muri Busari Close, Adeniyi Jones, Ikeja, Lagos State, Nigeria";

export type ContactDetails = {
  phones: string[];
  email: string;
  whatsappNumber: string;
  address: string;
};

/**
 * Resolves the operator's contact details for the footer, the contact page,
 * and the enquiry inbox. getSiteContent() is request-cached, so calling this
 * from several components in one render costs a single query.
 */
export async function getContactDetails(): Promise<ContactDetails> {
  const content = await getSiteContent();
  return {
    // Site Content only has a single "Contact phone" field
    // (lib/content/constants.ts's SITE_CONTENT_FIELDS) — the second number
    // has no admin field to override it, so it's always the brand default.
    phones: [
      content.contact_phone || DEFAULT_CONTACT_PHONES[0],
      DEFAULT_CONTACT_PHONES[1],
    ],
    email: content.contact_email || DEFAULT_CONTACT_EMAIL,
    whatsappNumber:
      content.whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
    address: content.office_address || DEFAULT_OFFICE_ADDRESS,
  };
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

export function mapsHref(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/**
 * `null` when no WhatsApp number is configured anywhere (Site Content or
 * NEXT_PUBLIC_WHATSAPP_NUMBER) — callers should hide the WhatsApp CTA
 * entirely rather than link to bare https://wa.me/, which opens WhatsApp
 * to nothing. Logged once per request so an unconfigured deploy is visible
 * in server logs instead of only discoverable by clicking the button.
 */
export function getWhatsAppHref(whatsappNumber: string): string | null {
  if (!whatsappNumber) {
    console.warn(
      "WhatsApp number isn't configured (Admin -> Site Content, or NEXT_PUBLIC_WHATSAPP_NUMBER) — hiding the WhatsApp CTA.",
    );
    return null;
  }
  return `https://wa.me/${whatsappNumber}`;
}
