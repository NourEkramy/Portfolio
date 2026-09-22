"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type ActionState } from "@/app/dashboard/actions";

const initial: ActionState = { status: "idle", message: "" };

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(signIn, initial);

  return (
    <form action={action} className="plate p-6 sm:p-8">
      <input type="hidden" name="next" value={next} />

      <label htmlFor="email" className="label">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="username"
        className="mt-2 w-full border border-rule bg-paper px-3.5 py-2.5 text-ink outline-none transition-colors focus:border-oxblood"
      />

      <label htmlFor="password" className="label mt-5 block">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        className="mt-2 w-full border border-rule bg-paper px-3.5 py-2.5 text-ink outline-none transition-colors focus:border-oxblood"
      />

      {state.status === "error" && (
        <p role="alert" className="mt-5 border border-oxblood bg-oxblood/8 px-4 py-3 text-sm text-oxblood">
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary mt-7 w-full disabled:opacity-60">
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}
