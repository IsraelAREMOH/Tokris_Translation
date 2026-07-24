"use server";

import { revalidatePath } from "next/cache";

import { getAdminContext } from "@/lib/auth/admin-context";
import { normalizeNewsletterSource } from "@/lib/blog/newsletter/constants";
import { logActivity } from "@/lib/cms/activity/log";
import { createPublicClient } from "@/lib/supabase/public-server";
import { UUID_PATTERN } from "@/lib/validation";

export type NewsletterActionState = {
  error?: string;
  success?: boolean;
};

function revalidateNewsletterViews() {
  revalidatePath("/[locale]/(admin)/admin/blog/newsletter", "page");
  revalidatePath("/[locale]/(admin)/admin/blog", "page");
}

// Excludes a leading =/+/-/@ (spreadsheet formula triggers) in the local
// part — email/source both eventually reach the admin's CSV export
// (newsletter/export/route.ts), so this is a second layer alongside that
// route's own escaping, not a substitute for it.
const EMAIL_PATTERN = /^[^\s@=+\-][^\s@]*@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

export async function subscribeToNewsletter(
  _prev: NewsletterActionState,
  formData: FormData,
): Promise<NewsletterActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const source = normalizeNewsletterSource(String(formData.get("source") ?? "blog").slice(0, 50));

  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email, source })
    .select("id")
    .single();

  if (error) {
    // Unique violation — already subscribed. Don't leak that distinction to
    // the visitor; just report success either way.
    if (error.code === "23505") return { success: true };
    console.error("Newsletter subscribe failed:", error.message);
    return { error: "Could not subscribe — please try again." };
  }

  // Anonymous, so this goes through a security-definer RPC (0010) rather
  // than a direct activity_log insert — mirrors record_post_view (0005).
  if (data) {
    await supabase.rpc("log_newsletter_signup", { p_subscriber_id: data.id });
  }

  return { success: true };
}

export async function deleteSubscriber(
  _prev: NewsletterActionState,
  formData: FormData,
): Promise<NewsletterActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) return { error: "Invalid subscriber." };

  const { data, error } = await context.supabase
    .from("newsletter_subscribers")
    .delete()
    .eq("id", id)
    .select("email")
    .maybeSingle();

  if (error) {
    console.error("Subscriber delete failed:", error.message);
    return { error: "Could not delete — please try again." };
  }

  if (data) {
    await logActivity(context.supabase, {
      eventType: "newsletter.deleted",
      entityType: "newsletter_subscriber",
      entityId: id,
      title: `Removed subscriber ${data.email}`,
      actorId: context.user.id,
    });
  }

  revalidateNewsletterViews();
  return { success: true };
}

/** Callable directly from client components (NewsletterManager's bulk-delete bar). */
export async function bulkDeleteSubscribers(ids: string[]): Promise<NewsletterActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };
  if (ids.length === 0) return { error: "No subscribers selected." };

  const { error } = await context.supabase
    .from("newsletter_subscribers")
    .delete()
    .in("id", ids);

  if (error) {
    console.error("Bulk subscriber delete failed:", error.message);
    return { error: "Could not delete the selected subscribers — please try again." };
  }

  await logActivity(context.supabase, {
    eventType: "newsletter.deleted",
    entityType: "newsletter_subscriber",
    title: `Removed ${ids.length} subscriber${ids.length === 1 ? "" : "s"}`,
    actorId: context.user.id,
  });

  revalidateNewsletterViews();
  return { success: true };
}
