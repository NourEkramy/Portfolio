"use server";

import { profile } from "@/content/profile";
import { sendEnquiry } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

export type ContactState = {
  status: "idle" | "success" | "error" | "unavailable";
  message: string;
  /**
   * Set when the message could not be delivered. The form turns this into a
   * one-click "open in your email app" button so the visitor never has to
   * retype what they wrote.
   */
  mailto?: string;
};

/** Pre-addressed mailto carrying whatever the visitor already typed. */
function composeMailto(name: string, email: string, subject: string, message: string) {
  const params = new URLSearchParams({
    subject: subject || `Portfolio enquiry from ${name}`,
    body: [message, "", "—", name, email].join("\n"),
  });
  return `mailto:${profile.email}?${params.toString()}`;
}

/**
 * Delivers a contact message to the inbox by email. A copy is kept in Supabase
 * only when the email fails, so nothing is silently lost; in the normal case
 * the message lands in the mailbox and nowhere else.
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

  const sent = await sendEnquiry({ to: profile.email, name, email, subject, message });

  if (sent.ok) {
    return {
      status: "success",
      message: "Thank you — your message is on its way to my inbox. I will reply soon.",
    };
  }

  // Email did not go out. Keep a copy if the database is reachable, so the
  // enquiry still exists somewhere, and hand the visitor a mailto either way.
  const supabase = await createClient();
  if (supabase) {
    await supabase
      .from("messages")
      .insert({ name, email, subject: subject || null, message })
      .then(() => undefined, () => undefined);
  }

  return {
    status: "unavailable",
    message:
      sent.error === "not-configured"
        ? "Email delivery is not switched on yet, so this form cannot send it for you."
        : "That could not be sent, and I would rather not lose what you wrote.",
    mailto: composeMailto(name, email, subject, message),
  };
}
