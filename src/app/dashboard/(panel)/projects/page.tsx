import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardProjectsPage() {
  const supabase = await createClient();
  const { data } = (await supabase
    ?.from("projects")
    .select("id, title, slug, subtitle, status, featured, sort_order, year")
    .order("sort_order")) ?? { data: [] };

  const rows = data ?? [];

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="display-md text-ink">Projects</h2>
          <p className="mt-1 text-sm text-ink-3">{rows.length} in the database</p>
        </div>
        <Link href="/dashboard/projects/new" className="btn btn-primary px-5 py-2.5 text-[0.68rem]">
          New project
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="plate p-8">
          <h3 className="font-display text-lg font-bold text-ink">Nothing here yet</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            The public site is currently rendering the five projects committed in{" "}
            <code className="font-mono text-[0.85em] text-ink">src/content/projects.ts</code>. Run{" "}
            <code className="font-mono text-[0.85em] text-ink">supabase/seed.sql</code> in the SQL
            editor to import them here, after which the database takes over.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {rows.map((row) => (
            <li key={row.id}>
              <Link href={`/dashboard/projects/${row.id}`} className="plate block p-5 transition-transform hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-bold leading-tight text-ink">{row.title}</h3>
                  <span className="shrink-0 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-3">
                    #{row.sort_order}
                  </span>
                </div>
                <p className="mt-1 font-display text-sm italic text-ink-3">{row.subtitle}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="chip">{row.status}</span>
                  {row.featured && <span className="chip text-oxblood">featured</span>}
                  <span className="chip">{row.year}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
