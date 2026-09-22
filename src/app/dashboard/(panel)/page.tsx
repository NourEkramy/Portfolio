import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [projects, messages, unread] = await Promise.all([
    supabase?.from("projects").select("id, title, slug, status, updated_at").order("sort_order"),
    supabase?.from("messages").select("id", { count: "exact", head: true }),
    supabase?.from("messages").select("id", { count: "exact", head: true }).eq("read", false),
  ]);

  const rows = projects?.data ?? [];
  const published = rows.filter((row) => row.status === "published").length;

  const stats = [
    { label: "Published", value: String(published) },
    { label: "Drafts", value: String(rows.length - published) },
    { label: "Messages", value: String(messages?.count ?? 0) },
    { label: "Unread", value: String(unread?.count ?? 0) },
  ];

  return (
    <div className="space-y-12">
      <section>
        <h2 className="label mb-5">At a glance</h2>
        <dl className="grid grid-cols-2 gap-px overflow-hidden border border-rule bg-rule sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-surface px-5 py-6 text-center">
              <dt className="label">{stat.label}</dt>
              <dd className="mt-1 font-display text-3xl font-bold text-oxblood">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="label">Projects</h2>
          <Link
            href="/dashboard/projects/new"
            className="link-underline font-mono text-[0.7rem] uppercase tracking-[0.16em] text-oxblood"
          >
            + New project
          </Link>
        </div>

        {rows.length === 0 ? (
          <div className="plate p-8 text-center">
            <p className="text-ink-2">
              No projects in the database yet. Run{" "}
              <code className="font-mono text-[0.85em] text-ink">supabase/seed.sql</code> to import
              the five committed in the repo, or create one by hand.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-rule-soft border-y border-rule-soft">
            {rows.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/projects/${row.id}`}
                    className="link-underline font-display text-lg font-bold text-ink hover:text-oxblood"
                  >
                    {row.title}
                  </Link>
                  <p className="font-mono text-[0.68rem] text-ink-3">/{row.slug}</p>
                </div>
                <span
                  className={`font-mono text-[0.62rem] uppercase tracking-[0.14em] ${
                    row.status === "published" ? "text-ink-3" : "text-oxblood"
                  }`}
                >
                  {row.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="label mb-5">Shortcuts</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { href: "/dashboard/projects", title: "Edit projects", detail: "Copy, media, stack, architecture." },
            { href: "/dashboard/messages", title: "Read messages", detail: "Everything sent through the contact form." },
            { href: "/dashboard/profile", title: "Edit profile", detail: "Bio, links, CV and portrait." },
          ].map((card) => (
            <Link key={card.href} href={card.href} className="plate p-5 transition-transform hover:-translate-y-0.5">
              <h3 className="font-display text-lg font-bold text-ink">{card.title}</h3>
              <p className="mt-1.5 text-sm text-ink-2">{card.detail}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
