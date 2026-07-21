import { getSiteContent } from "@/lib/content/site-content";

// Company contact details from the TGS brand document — used as fallbacks
// when the operator hasn't set values in Admin -> Site Content.
export const DEFAULT_CONTACT_PHONES = [
  "+234 912 188 4999",
  "+234 912 614 5745",
];
export const DEFAULT_CONTACT_EMAIL = "tokrisglobalservices@gmail.com";

export type ContactDetails = {
  phones: string[];
  email: string;
  whatsappNumber: string;
};

/**
 * Resolves the operator's contact details for the footer, the contact page,
 * and the enquiry inbox. getSiteContent() is request-cached, so calling this
 * from several components in one render costs a single query.
 */
export async function getContactDetails(): Promise<ContactDetails> {
  const content = await getSiteContent();
  return {
    phones: [
      content.contact_phone_primary || DEFAULT_CONTACT_PHONES[0],
      content.contact_phone_secondary || DEFAULT_CONTACT_PHONES[1],
    ],
    email: content.contact_email || DEFAULT_CONTACT_EMAIL,
    whatsappNumber:
      content.whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  };
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/\s+/g, "")}`;
}
