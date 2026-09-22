import Link from "next/link";
import { LoginForm } from "@/components/dashboard/login-form";
import { Ornament } from "@/components/ornament";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="text-center">
        <p className="label">Private</p>
        <h1 className="display-lg mt-3 text-ink">Dashboard</h1>
        <Ornament className="mx-auto my-7" />
      </div>

      {isSupabaseConfigured ? (
        <LoginForm next={next ?? "/dashboard"} />
      ) : (
        <div className="plate p-6">
          <h2 className="font-display text-lg font-bold text-oxblood">Supabase is not connected</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            The dashboard needs a database. Add{" "}
            <code className="font-mono text-[0.8em] text-ink">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="font-mono text-[0.8em] text-ink">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
            to <code className="font-mono text-[0.8em] text-ink">.env.local</code>, run the SQL in{" "}
            <code className="font-mono text-[0.8em] text-ink">supabase/</code>, then restart the dev
            server.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            The public site works without it — it renders the content committed in{" "}
            <code className="font-mono text-[0.8em] text-ink">src/content</code>.
          </p>
        </div>
      )}

      <Link
        href="/"
        className="link-underline mt-8 text-center font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-3"
      >
        ← Back to site
      </Link>
    </div>
  );
}
