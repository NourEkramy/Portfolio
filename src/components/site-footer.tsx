import Link from "next/link";
import type { Profile } from "@/lib/types";
import { Ornament } from "./ornament";

export function SiteFooter({ profile }: { profile: Profile }) {
  const year = new Date().getFullYear();

  const links = [
    { label: "GitHub", href: profile.github },
    profile.linkedin ? { label: "LinkedIn", href: profile.linkedin } : null,
    profile.leetcode ? { label: "LeetCode", href: profile.leetcode } : null,
    profile.codeforces ? { label: "CodeForces", href: profile.codeforces } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <Ornament className="mb-10" />

        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl font-bold text-ink">{profile.name}</p>
            <p className="label mt-2">{profile.title}</p>
            <p className="prose-vintage mt-4 max-w-sm text-sm">
              Available for Flutter roles. The fastest way to reach me is email.
            </p>
            <a
              href={`mailto:${profile.email}`}
              className="link-underline mt-3 inline-block font-mono text-sm text-oxblood"
            >
              {profile.email}
            </a>
          </div>

          <nav aria-label="Footer">
            <p className="label mb-4">Pages</p>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Home" },
                { href: "/projects", label: "Projects" },
                { href: "/cv", label: "CV" },
                { href: "/contact", label: "Contact" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="link-underline text-sm text-ink-2 transition-colors hover:text-oxblood"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="label mb-4">Elsewhere</p>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="link-underline text-sm text-ink-2 transition-colors hover:text-oxblood"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-rule-soft pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink-3">
            © {year} {profile.name}
          </p>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink-3">
            {profile.location}
          </p>
        </div>
      </div>
    </footer>
  );
}
