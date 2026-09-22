import Image from "next/image";
import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { Ornament, SectionLabel } from "@/components/ornament";
import { Reveal } from "@/components/reveal";
import { getExperience, getProfile, getProjects, getSkillGroups } from "@/lib/data";

export default async function HomePage() {
  const [profile, projects, experience, skills] = await Promise.all([
    getProfile(),
    getProjects(),
    getExperience(),
    getSkillGroups(),
  ]);

  const featured = projects.filter((project) => project.featured).slice(0, 3);
  const current = experience.find((item) => item.current);
  const mobileSkills = skills.find((group) => group.name === "Mobile Development");

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-rule">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:py-24">
          <div className="rise">
            <SectionLabel>Flutter App Developer</SectionLabel>

            <h1 className="display-xl mt-6 text-ink">
              NourEldin
              <br />
              <span className="text-oxblood">Ekramy Saad</span>
            </h1>

            <div className="rule-double my-8 max-w-md" />

            <p className="max-w-xl text-lg leading-relaxed text-ink-2">{profile.tagline}</p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/projects" className="btn btn-primary">
                View the work
              </Link>
              <a href={profile.cvUrl} download className="btn btn-ghost">
                <DownloadIcon />
                Download CV
              </a>
            </div>

            {current && (
              <p className="mt-8 flex flex-wrap items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-ink-3">
                <span className="inline-block size-1.5 rounded-full bg-oxblood" aria-hidden="true" />
                Currently {current.role} at {current.company}
              </p>
            )}
          </div>

          {/* Portrait in a keyline frame with a printed caption. */}
          <Reveal delay={120} className="justify-self-center lg:justify-self-end">
            <figure className="relative w-full max-w-[340px]">
              <div className="plate frame-keyline relative aspect-4/5 overflow-hidden">
                <Image
                  src={profile.portraitUrl}
                  alt={`Portrait of ${profile.name}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 70vw, 340px"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 flex items-center justify-between gap-3">
                <span className="label">{profile.location}</span>
                <span className="font-mono text-[0.68rem] text-ink-3">Est. 2021</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------- Ledger */}
      <section className="border-b border-rule bg-surface" aria-label="At a glance">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-y divide-rule-soft px-4 sm:px-6 md:grid-cols-4 md:divide-y-0">
          {[
            { value: String(projects.length), label: "Shipped projects" },
            { value: "16k+", label: "Lines of Dart" },
            { value: "160", label: "Tests on one app" },
            { value: "2", label: "Languages, both directions" },
          ].map((stat, index) => (
            <div key={stat.label} className="px-4 py-8 text-center first:border-l-0 md:px-6">
              <Reveal delay={index * 80}>
                <dt className="font-display text-4xl font-bold text-oxblood">{stat.value}</dt>
                <dd className="label mt-2">{stat.label}</dd>
              </Reveal>
            </div>
          ))}
        </dl>
      </section>

      {/* ------------------------------------------------------- Selected work */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionLabel>Selected work</SectionLabel>
              <h2 className="display-lg mt-4 text-ink">Applications, in detail</h2>
            </div>
            <Link
              href="/projects"
              className="link-underline font-mono text-[0.72rem] uppercase tracking-[0.16em] text-oxblood"
            >
              All {projects.length} projects →
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((project, index) => (
            <Reveal key={project.slug} delay={index * 110}>
              <ProjectCard project={project} priority={index === 0} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ Approach */}
      <section className="border-y border-rule bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <SectionLabel>How I build</SectionLabel>
            <h2 className="display-lg mt-4 max-w-2xl text-ink">
              Architecture first, because the second year of a codebase is longer than the first
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                n: 1,
                title: "Layers that hold",
                body: "Clean Architecture where the domain earns it, MVVM with Cubit where it does not. Repositories own the network, view models own state, views own neither. The dependency arrow points one way.",
              },
              {
                n: 2,
                title: "Localisation that is actually correct",
                body: "English and Arabic with real RTL mirroring, directional padding rather than left-pinned layouts, and ICU plural rules — because Arabic has six forms and an English-shaped guess is wrong most of the time.",
              },
              {
                n: 3,
                title: "Tested where it hurts",
                body: "Every screen rendered at small widths, at 1.6× accessibility text scale and in Arabic, so layout overflows fail the build instead of the user. HTTP exercised through the real Dio pipeline with a stub adapter.",
              },
            ].map((item, index) => (
              <Reveal key={item.n} delay={index * 110}>
                <article>
                  <span className="font-display text-5xl font-bold text-rule">
                    {String(item.n).padStart(2, "0")}
                  </span>
                  <h3 className="display-md mt-3 text-ink">{item.title}</h3>
                  <p className="mt-3 leading-relaxed text-ink-2">{item.body}</p>
                </article>
              </Reveal>
            ))}
          </div>

          {mobileSkills && (
            <Reveal delay={200}>
              <div className="mt-14">
                <Ornament className="mb-8" />
                <ul className="flex flex-wrap justify-center gap-2">
                  {mobileSkills.items.map((item) => (
                    <li key={item} className="chip">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------ Contact */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <Reveal>
          <SectionLabel>
            <span className="sr-only">Contact</span>
          </SectionLabel>
          <h2 className="display-lg mx-auto max-w-2xl text-ink">
            Looking for a Flutter developer who reads the whole spec?
          </h2>
          <p className="prose-vintage mx-auto mt-5 max-w-xl">
            <span>
              I am open to Flutter roles and freelance work. Send a note and I will reply with
              something more useful than a template.
            </span>
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="btn btn-primary">
              Get in touch
            </Link>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-ghost"
            >
              GitHub
            </a>
          </div>
        </Reveal>
      </section>
    </>
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
