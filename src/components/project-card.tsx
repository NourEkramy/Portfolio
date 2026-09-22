import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types";

/**
 * Index card for the projects grid: a framed screenshot, the metadata rule, and
 * the three headline packages. `priority` is for the first card only.
 */
export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  const cover = project.coverUrl ?? project.media[0]?.url;
  const packages = project.tech.filter((t) => t.kind === "package").slice(0, 3);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex h-full flex-col plate frame-keyline transition-transform duration-500 hover:-translate-y-1"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-sunken">
        {cover ? (
          <Image
            src={cover}
            alt={`${project.title} — ${project.subtitle}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 420px"
            priority={priority}
            className="object-cover object-top transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <span className="font-display text-5xl text-rule">{project.title.charAt(0)}</span>
          </div>
        )}

        {project.videoUrl && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 border border-rule bg-paper/90 px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-ink-2 backdrop-blur-sm">
            <svg viewBox="0 0 12 12" className="size-2.5 fill-oxblood" aria-hidden="true">
              <path d="M2 1.5v9l8-4.5z" />
            </svg>
            Demo
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="label">{project.category}</span>
          <span className="font-mono text-[0.68rem] text-ink-3">{project.year}</span>
        </div>

        <h3 className="mt-2.5 font-display text-xl font-bold leading-tight text-ink transition-colors group-hover:text-oxblood">
          {project.title}
        </h3>
        <p className="mt-1 font-display text-sm italic text-ink-3">{project.subtitle}</p>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-2">{project.summary}</p>

        <div className="mt-auto pt-5">
          <div className="rule-hair mb-3" />
          <div className="flex flex-wrap items-center gap-1.5">
            {packages.map((pkg) => (
              <span key={pkg.name} className="chip">
                {pkg.name}
              </span>
            ))}
            {project.tech.filter((t) => t.kind === "package").length > 3 && (
              <span className="font-mono text-[0.68rem] text-ink-3">
                +{project.tech.filter((t) => t.kind === "package").length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
