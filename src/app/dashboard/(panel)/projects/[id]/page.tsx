import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectEditor, type EditorProject } from "@/components/dashboard/project-editor";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const EMPTY: EditorProject = {
  id: null,
  slug: "",
  title: "",
  subtitle: "",
  summary: "",
  body: "",
  role: "",
  category: "Mobile Application",
  period: "",
  year: String(new Date().getFullYear()),
  featured: false,
  sortOrder: "10",
  status: "draft",
  repoUrl: "",
  liveUrl: "",
  paperUrl: "",
  coverUrl: "",
  videoUrl: "",
  architectureName: "",
  architectureSummary: "",
  architectureTree: "",
  architectureLayers: "",
  metrics: "",
  highlights: "",
  decisions: "",
  tech: "",
  media: "",
};

type Row = { sort_order: number } & Record<string, unknown>;

const sorted = <T extends Row>(rows: T[] | null | undefined): T[] =>
  [...(rows ?? [])].sort((a, b) => a.sort_order - b.sort_order);

export default async function ProjectEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";

  if (isNew) {
    return (
      <Shell title="New project" subtitle="Nothing is saved until you press save.">
        <ProjectEditor project={EMPTY} />
      </Shell>
    );
  }

  const supabase = await createClient();
  if (!supabase) notFound();

  const { data } = await supabase
    .from("projects")
    .select(
      `*,
       project_media(url, caption, kind, sort_order),
       project_tech(name, version, kind, note, sort_order),
       project_highlights(label, detail, sort_order),
       project_metrics(label, value, sort_order),
       project_decisions(title, detail, sort_order)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  const architecture = (data.architecture ?? {}) as {
    name?: string;
    summary?: string;
    tree?: string;
    layers?: { name: string; detail: string }[];
  };

  const project: EditorProject = {
    id: data.id,
    slug: data.slug ?? "",
    title: data.title ?? "",
    subtitle: data.subtitle ?? "",
    summary: data.summary ?? "",
    body: (data.body ?? []).join("\n"),
    role: data.role ?? "",
    category: data.category ?? "",
    period: data.period ?? "",
    year: data.year ? String(data.year) : "",
    featured: Boolean(data.featured),
    sortOrder: String(data.sort_order ?? 0),
    status: data.status ?? "published",
    repoUrl: data.repo_url ?? "",
    liveUrl: data.live_url ?? "",
    paperUrl: data.paper_url ?? "",
    coverUrl: data.cover_url ?? "",
    videoUrl: data.video_url ?? "",
    architectureName: architecture.name ?? "",
    architectureSummary: architecture.summary ?? "",
    architectureTree: architecture.tree ?? "",
    architectureLayers: (architecture.layers ?? [])
      .map((layer) => `${layer.name} :: ${layer.detail}`)
      .join("\n"),
    metrics: sorted(data.project_metrics)
      .map((row) => `${row.label} :: ${row.value}`)
      .join("\n"),
    highlights: sorted(data.project_highlights)
      .map((row) => `${row.label} :: ${row.detail}`)
      .join("\n"),
    decisions: sorted(data.project_decisions)
      .map((row) => `${row.title} :: ${row.detail}`)
      .join("\n"),
    tech: sorted(data.project_tech)
      .map((row) => [row.name, row.version ?? "", row.kind, row.note ?? ""].join(" | "))
      .join("\n"),
    media: sorted(data.project_media)
      .map((row) => `${row.url} :: ${row.caption ?? ""}`)
      .join("\n"),
  };

  return (
    <Shell
      title={project.title}
      subtitle={`/projects/${project.slug}`}
      viewHref={`/projects/${project.slug}`}
    >
      <ProjectEditor project={project} />
    </Shell>
  );
}

function Shell({
  title,
  subtitle,
  viewHref,
  children,
}: {
  title: string;
  subtitle: string;
  viewHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-5">
        <div>
          <Link
            href="/dashboard/projects"
            className="link-underline font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink-3"
          >
            ← Projects
          </Link>
          <h2 className="display-md mt-3 text-ink">{title}</h2>
          <p className="mt-1 font-mono text-[0.7rem] text-ink-3">{subtitle}</p>
        </div>
        {viewHref && (
          <Link
            href={viewHref}
            className="link-underline font-mono text-[0.7rem] uppercase tracking-[0.16em] text-oxblood"
          >
            View live ↗
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}
