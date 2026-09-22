"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/cv", label: "CV" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ cvUrl }: { cvUrl: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile sheet whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        scrolled ? "border-rule bg-paper/92 backdrop-blur-md" : "border-transparent bg-paper"
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2.5" aria-label="Home">
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            NourEldin
          </span>
          <span className="hidden text-[0.68rem] font-medium uppercase tracking-[0.22em] text-oxblood sm:inline">
            Ekramy Saad
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`link-underline font-mono text-[0.72rem] uppercase tracking-[0.18em] transition-colors ${
                isActive(item.href) ? "text-oxblood" : "text-ink-2 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href={cvUrl}
            download
            className="hidden border border-oxblood bg-oxblood px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#f8f1e2] transition-colors hover:bg-oxblood-2 sm:inline-flex dark:text-[#0c1622]"
          >
            Download CV
          </a>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Toggle menu"
            className="grid size-9 place-items-center border border-rule text-ink-2 md:hidden"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-rule bg-paper md:hidden" aria-label="Mobile">
          <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block border-b border-rule-soft py-3.5 font-mono text-[0.75rem] uppercase tracking-[0.18em] last:border-0 ${
                  isActive(item.href) ? "text-oxblood" : "text-ink-2"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={cvUrl}
              download
              className="mt-3 block bg-oxblood py-3 text-center font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[#f8f1e2] dark:text-[#0c1622]"
            >
              Download CV
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
