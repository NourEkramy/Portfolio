import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { SectionLabel } from "@/components/ornament";
import { Reveal } from "@/components/reveal";
import { getProjects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Flutter applications built with Clean Architecture, MVVM and Cubit — with the packages, structure and engineering decisions behind each one.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  const packageCount = new Set(
    projects.flatMap((project) =>
      project.tech.filter((tech) => tech.kind === "package").map((tech) => tech.name),
    ),
  ).size;

  return (
    <>
      <section className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="rise">
            <SectionLabel>The work</SectionLabel>
            <h1 className="display-xl mt-6 max-w-3xl text-ink">Projects</h1>
            <div className="rule-double my-8 max-w-md" />
            <p className="max-w-2xl text-lg leading-relaxed text-ink-2">
              Five Flutter applications, from a graduation project that became a published paper to
              a food-delivery client with 160 tests. Each one lists the packages it actually
              depends on, the folder structure it actually uses, and the decisions worth defending.
            </p>

            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {[
                { label: "Projects", value: String(projects.length) },
                { label: "Distinct packages", value: String(packageCount) },
                { label: "Architectures", value: "Clean · MVVM · Cubit" },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="label">{item.label}</dt>
                  <dd className="mt-1 font-display text-2xl font-bold text-oxblood">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <Reveal key={project.slug} delay={(index % 3) * 100}>
              <ProjectCard project={project} priority={index === 0} />
            </Reveal>
          ))}
        </div>

        {projects.length === 0 && (
          <p className="py-20 text-center text-ink-3">No projects published yet.</p>
        )}
      </section>
    </>
  );
}
