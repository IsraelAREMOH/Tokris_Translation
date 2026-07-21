"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { MAX_MESSAGE_LENGTH, UUID_PATTERN } from "@/lib/validation";

export type PortalActionState = {
  error?: string;
  success?: boolean;
};

/**
 * Client-side timeline message. Runs as the logged-in client, so the
 * "Participants can send messages" RLS policy guarantees the sender can only
 * post to their own projects — no ownership lookup needed here.
 */
export async function sendProjectMessage(
  _prev: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your session has expired — please log in again." };
  }

  const projectId = String(formData.get("projectId") ?? "");
  const messageText = String(formData.get("message") ?? "").trim();

  if (!UUID_PATTERN.test(projectId)) {
    return { error: "Invalid message request." };
  }
  if (!messageText) {
    return { error: "Write a message before sending." };
  }
  if (messageText.length > MAX_MESSAGE_LENGTH) {
    return {
      error: `Messages are limited to ${MAX_MESSAGE_LENGTH} characters.`,
    };
  }

  const { error } = await supabase.from("messages").insert({
    project_id: projectId,
    sender_id: user.id,
    message_text: messageText,
  });

  if (error) {
    console.error("Portal message send failed:", error.message);
    return { error: "Could not send the message — please try again." };
  }

  revalidatePath("/[locale]/(portal)/portal/requests/[id]", "page");
  revalidatePath("/[locale]/(admin)/admin/projects/[id]", "page");
  return { success: true };
}
