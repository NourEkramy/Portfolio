import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/gallery";
import { Numeral, Ornament, SectionLabel } from "@/components/ornament";
import { Reveal } from "@/components/reveal";
import { VideoPlayer } from "@/components/video-player";
import { getProject, getProjectSlugs, getProjects } from "@/lib/data";
import type { Tech, TechKind } from "@/lib/types";

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found" };

  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: `${project.title} — ${project.subtitle}`,
      description: project.summary,
      images: project.coverUrl ? [project.coverUrl] : undefined,
    },
  };
}

const TECH_GROUPS: { kind: TechKind; heading: string }[] = [
  { kind: "package", heading: "Flutter packages" },
  { kind: "language", heading: "Platform" },
  { kind: "service", heading: "Backend & services" },
  { kind: "concept", heading: "Patterns" },
  { kind: "tool", heading: "Tooling" },
];

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const all = await getProjects();
  const index = all.findIndex((item) => item.slug === project.slug);
  const next = all[(index + 1) % all.length];

  const grouped = TECH_GROUPS.map((group) => ({
    ...group,
    items: project.tech.filter((tech) => tech.kind === group.kind),
  })).filter((group) => group.items.length > 0);

  return (
    <article>
      {/* ---------------------------------------------------------------- Head */}
      <header className="border-b border-rule">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:py-20">
          <Link
            href="/projects"
            className="link-underline font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-3"
          >
            ← All projects
          </Link>

          <div className="rise mt-8">
            <SectionLabel>{project.category}</SectionLabel>
            <h1 className="display-xl mt-5 text-ink">{project.title}</h1>
            <p className="mt-3 font-display text-xl italic text-oxblood sm:text-2xl">
              {project.subtitle}
            </p>

            <div className="rule-double my-8" />

            <p className="max-w-3xl text-lg leading-relaxed text-ink-2">{project.summary}</p>

            <dl className="mt-10 grid gap-6 sm:grid-cols-3">
              <div>
                <dt className="label">Role</dt>
                <dd className="mt-1.5 text-sm leading-snug text-ink-2">{project.role}</dd>
              </div>
              <div>
                <dt className="label">Period</dt>
                <dd className="mt-1.5 font-mono text-sm text-ink-2">{project.period}</dd>
              </div>
              <div>
                <dt className="label">Source</dt>
                <dd className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="link-underline font-mono text-sm text-oxblood"
                    >
                      GitHub ↗
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="link-underline font-mono text-sm text-oxblood"
                    >
                      Live ↗
                    </a>
                  )}
                  {project.paperUrl && (
                    <a
                      href={project.paperUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="link-underline font-mono text-sm text-oxblood"
                    >
                      Paper ↗
                    </a>
                  )}
                  {!project.repoUrl && !project.liveUrl && !project.paperUrl && (
                    <span className="font-mono text-sm text-ink-3">Private</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- Metrics */}
      {project.metrics.length > 0 && (
        <section className="border-b border-rule bg-surface" aria-label="Project metrics">
          <dl className="mx-auto flex max-w-5xl flex-wrap justify-center gap-x-12 gap-y-6 px-4 py-8 sm:px-6">
            {project.metrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <dt className="label">{metric.label}</dt>
                <dd className="mt-1 font-display text-2xl font-bold text-oxblood">{metric.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* ---------------------------------------------------------- Overview */}
        {project.body.length > 0 && (
          <Reveal>
            <section className="py-16">
              <SectionLabel>Overview</SectionLabel>
              <div className="prose-vintage drop-cap mt-6 max-w-3xl text-[1.0625rem]">
                {project.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {/* ------------------------------------------------------------- Video */}
        {project.videoUrl && (
          <Reveal>
            <section className="pb-16">
              <SectionLabel>Demo</SectionLabel>
              <h2 className="display-md mt-4 mb-6 text-ink">The app, running</h2>
              <VideoPlayer
                src={project.videoUrl}
                poster={project.posterUrl ?? project.coverUrl ?? project.media[0]?.url}
                label={`${project.title} — recorded walkthrough`}
              />
            </section>
          </Reveal>
        )}

        {/* ------------------------------------------------------ Architecture */}
        {project.architecture && (
          <Reveal>
            <section className="border-t border-rule py-16">
              <SectionLabel>Architecture</SectionLabel>
              <h2 className="display-lg mt-4 text-ink">{project.architecture.name}</h2>
              <p className="prose-vintage mt-5 max-w-3xl">
                <span>{project.architecture.summary}</span>
              </p>

              {project.architecture.layers && project.architecture.layers.length > 0 && (
                <ul className="mt-8 grid gap-px overflow-hidden border border-rule bg-rule sm:grid-cols-2">
                  {project.architecture.layers.map((layer) => (
                    <li key={layer.name} className="bg-surface p-5">
                      <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-oxblood">
                        {layer.name}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-2">{layer.detail}</p>
                    </li>
                  ))}
                </ul>
              )}

              {project.architecture.tree && (
                <div className="plate-inset mt-8 overflow-x-auto">
                  <div className="flex items-center justify-between border-b border-rule-soft px-4 py-2">
                    <span className="label">Project structure</span>
                    <span className="font-mono text-[0.68rem] text-ink-3">lib/</span>
                  </div>
                  <pre className="overflow-x-auto p-5 font-mono text-[0.76rem] leading-relaxed text-ink-2">
                    <code>{project.architecture.tree}</code>
                  </pre>
                </div>
              )}
            </section>
          </Reveal>
        )}

        {/* -------------------------------------------------------- Highlights */}
        {project.highlights.length > 0 && (
          <Reveal>
            <section className="border-t border-rule py-16">
              <SectionLabel>What I built</SectionLabel>
              <h2 className="display-lg mt-4 text-ink">Features and engineering</h2>

              <ul className="mt-10 space-y-8">
                {project.highlights.map((highlight, i) => (
                  <li key={highlight.label} className="flex gap-5">
                    <Numeral value={i + 1} />
                    <div className="min-w-0 flex-1 border-b border-rule-soft pb-8 last:border-0">
                      <h3 className="display-md text-ink">{highlight.label}</h3>
                      <p className="mt-2 max-w-3xl leading-relaxed text-ink-2">{highlight.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        )}

        {/* --------------------------------------------------------- Decisions */}
        {project.decisions && project.decisions.length > 0 && (
          <Reveal>
            <section className="border-t border-rule py-16">
              <SectionLabel>Decisions</SectionLabel>
              <h2 className="display-lg mt-4 max-w-2xl text-ink">
                Choices that needed a reason, not a default
              </h2>

              <div className="mt-10 grid gap-6 md:grid-cols-2">
                {project.decisions.map((decision) => (
                  <article key={decision.title} className="plate p-6">
                    <h3 className="font-display text-lg font-bold leading-snug text-oxblood">
                      {decision.title}
                    </h3>
                    <div className="rule-hair my-3.5" />
                    <p className="text-sm leading-relaxed text-ink-2">{decision.detail}</p>
                  </article>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {/* ------------------------------------------------------------- Stack */}
        {grouped.length > 0 && (
          <Reveal>
            <section className="border-t border-rule py-16">
              <SectionLabel>Stack</SectionLabel>
              <h2 className="display-lg mt-4 text-ink">What it is built with</h2>

              <div className="mt-10 space-y-10">
                {grouped.map((group) => (
                  <div key={group.kind}>
                    <h3 className="label mb-4">{group.heading}</h3>
                    {group.kind === "package" || group.kind === "service" ? (
                      <ul className="divide-y divide-rule-soft border-y border-rule-soft">
                        {group.items.map((tech) => (
                          <TechRow key={tech.name} tech={tech} />
                        ))}
                      </ul>
                    ) : (
                      <ul className="flex flex-wrap gap-2">
                        {group.items.map((tech) => (
                          <li key={tech.name} className="chip">
                            {tech.name}
                            {tech.version && <span className="text-ink-3">{tech.version}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {/* ----------------------------------------------------------- Gallery */}
        {project.media.length > 0 && (
          <Reveal>
            <section className="border-t border-rule py-16">
              <SectionLabel>Screens</SectionLabel>
              <h2 className="display-lg mt-4 text-ink">
                {project.media.length} {project.media.length === 1 ? "screen" : "screens"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-ink-3">
                Select any screen to view it full size. Arrow keys move between them.
              </p>
              <div className="mt-10">
                <Gallery items={project.media} />
              </div>
            </section>
          </Reveal>
        )}
      </div>

      {/* ---------------------------------------------------------- Next project */}
      {next && next.slug !== project.slug && (
        <section className="border-t border-rule bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
            <Ornament className="mb-10" />
            <Link href={`/projects/${next.slug}`} className="group block">
              <span className="label">Next project</span>
              <h2 className="display-lg mt-3 text-ink transition-colors group-hover:text-oxblood">
                {next.title}
                <span className="ml-3 inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </h2>
              <p className="mt-2 font-display text-lg italic text-ink-3">{next.subtitle}</p>
            </Link>
          </div>
        </section>
      )}
    </article>
  );
}

/** One dependency: name, pinned version, and what it is doing here. */
function TechRow({ tech }: { tech: Tech }) {
  return (
    <li className="grid gap-1 py-3.5 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-6">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-sm text-ink">{tech.name}</span>
        {tech.version && <span className="font-mono text-[0.72rem] text-ink-3">{tech.version}</span>}
      </div>
      {tech.note && <p className="text-sm leading-relaxed text-ink-2">{tech.note}</p>}
    </li>
  );
}
