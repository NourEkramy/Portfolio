"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitMessage, type ContactState } from "@/app/contact/actions";

const initial: ContactState = { status: "idle", message: "" };

export function ContactForm({ fallbackEmail }: { fallbackEmail: string }) {
  const [state, action] = useActionState(submitMessage, initial);

  if (state.status === "success") {
    return (
      <div className="plate frame-keyline p-10 text-center">
        <p className="font-display text-4xl text-oxblood" aria-hidden="true">
          ✦
        </p>
        <h3 className="display-md mt-4 text-ink">Message sent</h3>
        <p className="mt-2 text-ink-2">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="plate p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" required autoComplete="name" />
        <Field label="Email" name="email" type="email" required autoComplete="email" />
      </div>

      <div className="mt-5">
        <Field label="Subject" name="subject" autoComplete="off" />
      </div>

      <div className="mt-5">
        <label htmlFor="message" className="label">
          Message <span className="text-oxblood">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          maxLength={5000}
          className="mt-2 w-full resize-y border border-rule bg-paper px-3.5 py-2.5 text-ink outline-none transition-colors focus:border-oxblood"
        />
      </div>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" && (
        <p role="alert" className="mt-5 border border-oxblood bg-oxblood/8 px-4 py-3 text-sm text-oxblood">
          {state.message}{" "}
          <a href={`mailto:${fallbackEmail}`} className="link-underline font-mono">
            {fallbackEmail}
          </a>
        </p>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <SubmitButton />
        <p className="font-mono text-[0.68rem] text-ink-3">Fields marked * are required.</p>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
      {pending ? "Sending…" : "Send message"}
    </button>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label} {required && <span className="text-oxblood">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="mt-2 w-full border border-rule bg-paper px-3.5 py-2.5 text-ink outline-none transition-colors focus:border-oxblood"
      />
    </div>
  );
}
