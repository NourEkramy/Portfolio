"use server";

import { profile } from "@/content/profile";
import { createClient } from "@/lib/supabase/server";

export type ContactState = {
  status: "idle" | "success" | "error" | "unavailable";
  message: string;
  /**
   * Set when the message could not be stored. The form turns this into a
   * one-click "open in your email app" button so the visitor never has to
   * retype what they wrote.
   */
  mailto?: string;
};

/** Pre-addressed mailto carrying whatever the visitor already typed. */
function composeMailto(name: string, email: string, subject: string, message: string) {
  const body = [message, "", "—", name, email].filter((line) => line !== undefined).join("\n");
  const params = new URLSearchParams({
    subject: subject || `Portfolio enquiry from ${name}`,
    body,
  });
  return `mailto:${profile.email}?${params.toString()}`;
}

/**
 * Stores a contact message in Supabase. If the table is not there yet, or
 * Supabase is not configured at all, the visitor is handed a pre-filled mailto
 * rather than a dead end.
 */
export async function submitMessage(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  // Bots fill hidden fields; humans leave them empty.
  const honeypot = String(formData.get("company") ?? "").trim();

  if (honeypot) return { status: "success", message: "Thank you — your message has been sent." };

  if (!name || !email || !message) {
    return { status: "error", message: "Name, email and message are all required." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "That email address does not look right." };
  }

  if (message.length > 5000) {
    return { status: "error", message: "That message is too long — 5000 characters maximum." };
  }

  const mailto = composeMailto(name, email, subject, message);

  const supabase = await createClient();
  if (!supabase) {
    return {
      status: "unavailable",
      message: "The message store is not connected yet, so this form cannot deliver it.",
      mailto,
    };
  }

  const { error } = await supabase
    .from("messages")
    .insert({ name, email, subject: subject || null, message });

  if (error) {
    // PGRST205 is "table not in the schema cache", i.e. the schema has not been
    // applied. Anything else is a genuine failure, but either way the visitor
    // gets the same escape hatch.
    const notSetUp = error.code === "PGRST205";
    return {
      status: "unavailable",
      message: notSetUp
        ? "The message store is not connected yet, so this form cannot deliver it."
        : "That could not be sent, and I would rather not lose what you wrote.",
      mailto,
    };
  }

  return { status: "success", message: "Thank you — your message has been sent. I will reply soon." };
}
