import "server-only";

/**
 * Transactional email through Resend's REST API. Called directly with fetch
 * rather than through the SDK — it is one POST, and a dependency that ships a
 * whole client for that is not worth the install.
 */
const RESEND_ENDPOINT = "https://api.resend.com/emails";

export const isEmailConfigured = Boolean(process.env.RESEND_API_KEY);

/**
 * Resend's shared sender works without verifying a domain, but will only
 * deliver to the address the Resend account was created with — which is exactly
 * the constraint this form wants. Set MAIL_FROM once a custom domain is
 * verified, e.g. "NourEldin Portfolio <hello@yourdomain.com>".
 */
const FROM = process.env.MAIL_FROM || "Portfolio <onboarding@resend.dev>";

export interface EnquiryEmail {
  to: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export type SendResult = { ok: true; id: string } | { ok: false; error: string };

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendEnquiry(enquiry: EnquiryEmail): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "not-configured" };

  const subject = enquiry.subject?.trim()
    ? `Portfolio — ${enquiry.subject.trim()}`
    : `Portfolio enquiry from ${enquiry.name}`;

  const text = [
    enquiry.message,
    "",
    "—",
    `From: ${enquiry.name} <${enquiry.email}>`,
    "Sent from the contact form on your portfolio.",
  ].join("\n");

  const html = `
    <div style="font-family:Georgia,serif;max-width:560px;color:#241a12">
      <p style="font:500 11px/1 monospace;letter-spacing:.18em;text-transform:uppercase;color:#756047">
        Portfolio enquiry
      </p>
      <h2 style="font-size:20px;margin:8px 0 4px">${escapeHtml(enquiry.name)}</h2>
      <p style="margin:0 0 20px">
        <a href="mailto:${escapeHtml(enquiry.email)}" style="color:#7a1e2b">${escapeHtml(enquiry.email)}</a>
      </p>
      <div style="border-top:1px solid #cbb28c;border-bottom:1px solid #cbb28c;padding:18px 0;white-space:pre-wrap;line-height:1.7">${escapeHtml(enquiry.message)}</div>
      <p style="font:11px/1.6 monospace;color:#756047;margin-top:18px">
        Reply to this email and it goes straight back to them.
      </p>
    </div>
  `;

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [enquiry.to],
        subject,
        text,
        html,
        // So hitting reply in the mail client answers the sender, not Resend.
        reply_to: enquiry.email,
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return { ok: false, error: payload?.message ?? `Resend returned ${response.status}` };
    }

    return { ok: true, id: payload.id ?? "sent" };
  } catch (cause) {
    return { ok: false, error: cause instanceof Error ? cause.message : "network error" };
  }
}
