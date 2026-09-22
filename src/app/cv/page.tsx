import type { Metadata } from "next";
import { Ornament, SectionLabel } from "@/components/ornament";
import { Reveal } from "@/components/reveal";
import { getEducation, getExperience, getProfile, getProjects, getSkillGroups } from "@/lib/data";

export const metadata: Metadata = {
  title: "CV",
  description:
    "Curriculum vitae of NourEldin Ekramy Saad — Flutter App Developer. Experience, education, projects and skills, with a downloadable PDF.",
};

export default async function CvPage() {
  const [profile, experience, education, skills, projects] = await Promise.all([
    getProfile(),
    getExperience(),
    getEducation(),
    getSkillGroups(),
    getProjects(),
  ]);

  const contactLinks = [
    { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    { label: "Phone", value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
    { label: "GitHub", value: "NourEkramy", href: profile.github },
    profile.linkedin ? { label: "LinkedIn", value: "NourEldin Ekramy", href: profile.linkedin } : null,
  ].filter(Boolean) as { label: string; value: string; href: string }[];

  return (
    <>
      {/* ----------------------------------------------------------- Masthead */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="rise text-center">
            <SectionLabel>
              <span className="sr-only">Curriculum vitae</span>
            </SectionLabel>
            <p className="label">Curriculum Vitae</p>
            <h1 className="display-xl mt-4 text-ink">{profile.name}</h1>
            <p className="mt-3 font-display text-xl italic text-oxblood sm:text-2xl">
              {profile.title}
            </p>

            <Ornament className="mx-auto my-8 max-w-sm" />

            <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
              {contactLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noreferrer noopener" : undefined}
                    className="link-underline font-mono text-[0.78rem] text-ink-2 hover:text-oxblood"
                  >
                    {link.value}
                  </a>
                </li>
              ))}
            </ul>

            <div className="no-print mt-9 flex flex-wrap items-center justify-center gap-3">
              <a href={profile.cvUrl} download className="btn btn-primary">
                <DownloadIcon />
                Download PDF
              </a>
              <a
                href={profile.cvUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="btn btn-ghost"
              >
                Open in new tab
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* ------------------------------------------------------------ Profile */}
        <Reveal>
          <Section title="Profile">
            <div className="prose-vintage max-w-none">
              {profile.bio.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </Section>
        </Reveal>

        {/* --------------------------------------------------------- Experience */}
        <Reveal>
          <Section title="Professional experience">
            <ol className="space-y-10">
              {experience.map((item) => (
                <li key={`${item.company}-${item.period}`}>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                    <h3 className="display-md text-ink">
                      {item.role}
                      {item.current && (
                        <span className="ml-3 align-middle font-mono text-[0.6rem] uppercase tracking-[0.14em] text-oxblood">
                          Current
                        </span>
                      )}
                    </h3>
                    <span className="shrink-0 font-mono text-[0.72rem] text-ink-3">
                      {item.period}
                    </span>
                  </div>

                  <p className="mt-1 font-display italic text-oxblood">
                    {item.company}
                    {item.location && <span className="text-ink-3"> · {item.location}</span>}
                  </p>

                  <ul className="mt-4 space-y-2">
                    {item.bullets.map((bullet, i) => (
                      <li key={i} className="flex gap-3 text-[0.95rem] leading-relaxed text-ink-2">
                        <span className="mt-2.5 size-1 shrink-0 rounded-full bg-oxblood" aria-hidden="true" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </Section>
        </Reveal>

        {/* ----------------------------------------------------------- Projects */}
        <Reveal>
          <Section title="Projects">
            <ol className="space-y-7">
              {projects.map((project) => (
                <li key={project.slug}>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                    <h3 className="display-md text-ink">
                      {project.title}
                      <span className="ml-2 font-body text-sm font-normal not-italic text-ink-3">
                        {project.tech
                          .filter((t) => t.kind === "language" || t.kind === "service")
                          .map((t) => t.name)
                          .join(" · ")}
                      </span>
                    </h3>
                    <span className="shrink-0 font-mono text-[0.72rem] text-ink-3">
                      {project.period}
                    </span>
                  </div>
                  <p className="mt-2 max-w-3xl text-[0.95rem] leading-relaxed text-ink-2">
                    {project.summary}
                  </p>
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="link-underline mt-1.5 inline-block font-mono text-[0.72rem] text-oxblood"
                    >
                      {project.repoUrl.replace("https://github.com/", "github.com/")} ↗
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </Section>
        </Reveal>

        {/* ---------------------------------------------------------- Education */}
        <Reveal>
          <Section title="Education & training">
            <ol className="space-y-7">
              {education.map((item) => (
                <li key={`${item.institution}-${item.period}`}>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                    <h3 className="display-md text-ink">{item.title}</h3>
                    <span className="shrink-0 font-mono text-[0.72rem] text-ink-3">
                      {item.period}
                    </span>
                  </div>
                  <p className="mt-1 font-display italic text-oxblood">
                    {item.institution}
                    {item.location && <span className="text-ink-3"> · {item.location}</span>}
                  </p>
                  {item.detail && (
                    <p className="mt-2 max-w-3xl text-[0.95rem] leading-relaxed text-ink-2">
                      {item.detail}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </Section>
        </Reveal>

        {/* ------------------------------------------------------------- Skills */}
        <Reveal>
          <Section title="Skills">
            <div className="space-y-7">
              {skills.map((group) => (
                <div key={group.name}>
                  <h3 className="label mb-3">{group.name}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <li key={item} className="chip">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        </Reveal>

        {/* ---------------------------------------------------------- Languages */}
        <Reveal>
          <Section title="Languages" last>
            <dl className="flex flex-wrap gap-x-14 gap-y-4">
              {profile.languages.map((language) => (
                <div key={language.name}>
                  <dt className="display-md text-ink">{language.name}</dt>
                  <dd className="label mt-1">{language.level}</dd>
                </div>
              ))}
            </dl>
          </Section>
        </Reveal>
      </div>

      <section className="no-print border-t border-rule bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6">
          <p className="label">Prefer it on paper?</p>
          <h2 className="display-lg mt-3 text-ink">Download the PDF</h2>
          <a href={profile.cvUrl} download className="btn btn-primary mt-7">
            <DownloadIcon />
            NourEldin Ekramy Saad — CV
          </a>
        </div>
      </section>
    </>
  );
}

function Section({
  title,
  children,
  last = false,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section className={`py-12 ${last ? "" : "border-b border-rule"}`}>
      <h2 className="label mb-7 text-oxblood">{title}</h2>
      {children}
    </section>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden="true">
      <path
        d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 19h16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
