"use server";

import { createClient } from "@/lib/supabase/server";

export type ContactState = { status: "idle" | "success" | "error"; message: string };

/**
 * Stores a contact message. Without Supabase there is nowhere to put it, so the
 * form says so plainly and points at the email address rather than pretending
 * the message was delivered.
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

  const supabase = await createClient();
  if (!supabase) {
    return {
      status: "error",
      message: "The message form is not connected yet. Please email me directly instead.",
    };
  }

  const { error } = await supabase
    .from("messages")
    .insert({ name, email, subject: subject || null, message });

  if (error) {
    return { status: "error", message: "Something went wrong sending that. Please email me instead." };
  }

  return { status: "success", message: "Thank you — your message has been sent. I will reply soon." };
}
